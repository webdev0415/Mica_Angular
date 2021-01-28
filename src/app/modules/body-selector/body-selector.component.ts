import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output, SimpleChanges, OnChanges
} from '@angular/core';
import { viewImagesMap, svgDimensions, physicalZoomedImages } from './mappings/images';
import { perspectiveAnimate, fadeIn } from './body-selector.animations';
import * as _ from 'lodash';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';

@Component({
  selector: 'mica-body-selector',
  templateUrl: './body-selector.component.html',
  styleUrls: ['./body-selector.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, perspectiveAnimate]
})
export class BodySelectorComponent implements OnInit, OnDestroy, OnChanges {
  /**
   * "select" will highlight which shape has been selected in the image
   * "pick" will emit the value only. It won't highlight selection in the image
   */
  @Input() selectionBehaviour = 'select';

  /**
   * Input and Output of main values
   * This component only does one thing for other components: emit a string with a body part on selection
   * It also accepts two inputs:
   * - Available views
   * - Default view
   * - Default selection (body part)
   */
  @Input() bodyViewsNames = ['general', 'muscle', 'skin', 'bone'];
  @Input() defaultViewIndex = 0;
  @Input() defaultZone: string;
  @Input() defaultBodyPart: string;
  @Input() svgShapes: MICA.BodyImage.ViewSVGMap;
  @Input() defaultViewName: string;
  @Input() wholeBody: string;
  @Input() selectedBodyParts: string[];

  @Output() bodyPartChange: EventEmitter<MICA.BodyImage.Output> = new EventEmitter();

  selectedShapes: string[] = [];
  /**
   * IMAGES AND SVG MAPPINGS
   * SVG shapes are to be rendered on top of the body view (background)
   */
  internalAnimationsOn = false;
  showMappings = false;
  readonly svgConfig: MICA.BodyImage.SVGConfig = svgDimensions;

  private readonly fullBodyName = 'Whole Body';
  private readonly viewImagesMap: MICA.BodyImage.View = viewImagesMap;
  private zoomedOnPart: string = this.fullBodyName; // either selectedPath[2] or a zoomed in part
  private closeUpImages: {[name: string]: MICA.BodyImage.Image} = physicalZoomedImages;

  /**
   * PERSPECTIVE: One of the three images. E.g.: front, side, back
   */
  private perspectiveNames = _.map(this.bodyImages, img => img.name);
  // Index which will always be the highlighted picture. It will normally be 1 (e.g.: 1 if 3 images, 1 if 2 images)
  private readonly activePerspectiveIndex = Math.floor(this.perspectiveNames.length / 2);
  // Name of image which should be selected first based on position property
  /* istanbul ignore next */
  private readonly defaultPerspectiveName = (() => {
    const defaultPerspective = _.find(this.bodyImages, {'position': this.activePerspectiveIndex});
    return defaultPerspective ? defaultPerspective.name : '';
  })();

  /**
   * INSTANCE'S STATE
   * Selection needs to be tracked separated as an active shape can be on its own (e.g.: scalp) or part of a group(e.g.: eyes, ears)
   */
  selectedPath: MICA.BodyImage.SelectedPath = [ // [view, perspective, zone, sides]
    this.bodyViewsNames[this.defaultViewIndex],
    this.defaultPerspectiveName,
    this.fullBodyName,
    [this.fullBodyName]
  ];

// TimerId for resetZoom()
  timerId: any;

  private subs: Subscription[] = [];

  constructor(private cd: ChangeDetectorRef,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.subs.push(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        const params = this.route.snapshot.queryParams;

        this.adjustView(params);
      })
    );

    this.adjustView(this.route.snapshot.queryParams);
  }

  ngOnChanges(changes: SimpleChanges) {
    const { selectedBodyParts } = changes;
    const currentSelectedShapes = this.selectedShapes;

    if (selectedBodyParts && selectedBodyParts.currentValue[0] !== this.fullBodyName) {
      const clickedPart = _.difference(selectedBodyParts.currentValue, currentSelectedShapes)[0];

      if (clickedPart) {
        this.onBodyPartClicked(clickedPart);
      }
    }
  }

  ngOnDestroy() {
    this.cd.detach();
    this.clearTimeout();
    this.subs.forEach(s => s.unsubscribe());
  }

  /**
   * EVENT LISTENERS
   */

  onBodyPartClicked(value: string, zone?: MICA.BodyImage.SVGGroup) {
    const _zone = zone || this.findZone(value);

    if (!_zone) {
      console.error('Unable to determine body\'s zone');
      return;
    }

    this.showMappings = false;

    // select body part(s) and/or side(s)
    const selectedPath = this.getSelectedPath(_.clone(this.selectedPath), _zone, value);
    const foundParentGroup = this.findParentGroupData(selectedPath[1], selectedPath[0], value);

    if (!zone && !foundParentGroup) {
      selectedPath[1] = 'back';
      this.perspectiveActiveName = 'back';
    }

    this.setSelectedShapes(selectedPath, _zone, value);

    if (this.selectedShapes.length < 1) {
      return this.resetZoom();
    }

    this.triggerZoom(zone, _zone, value, selectedPath);
    this.setZoomedPart(_zone);
    this.selectedPath = selectedPath;
    this.bodyPartChange.emit({
      selectedPath: _.cloneDeep(selectedPath),
      bodyParts: this.getZoneShapeNames(_zone)
    });

    if (!zone) {
      // method triggered from outside
      this.cd.markForCheck();
    }
  }

  /**
   * VIEWS
   */

  get bodyImages(): MICA.BodyImage.Image[] {
    // selectedPath may not be set yet for all properties in constructor
    return this.viewImagesMap[this.selectedPath ? this.selectedPath[0] : this.bodyViewsNames[this.defaultViewIndex]];
  }

  get zoneSvgMappings(): MICA.BodyImage.SVGGroup[] {
    const path = _.take(this.selectedPath, 2);
    const bodyPart = this.zoomedOnPart || this.selectedPath[2];

    if (bodyPart === 'Chest' && path[path.length - 1] === 'side') {
      path[path.length - 1] = 'front';
    }

    return _.get(this.svgShapes, [...path, bodyPart] as string[]) as MICA.BodyImage.SVGGroup[];
  }

  get activeCloseUpImage(): MICA.BodyImage.Image {
    // to be displayed instead of full body on certain zones like mouth
    return this.closeUpImages[this.zoomedOnPart];
  }

  get canResetZoom() {
    // reset button should not be clicked before transition ends.
    // Else there may be change detection issues
    return this.showMappings && this.selectedPath[2] !== this.fullBodyName;
  }

  /**
   * OTHER
   */

  resetZoom() {
    this.showMappings = false;
    this.selectedPath[2] = this.fullBodyName;
    this.selectedPath[3] = [this.fullBodyName];
    this.zoomedOnPart = this.fullBodyName;
    this.selectedShapes = [this.fullBodyName];
    this.clearTimeout();
    this.timerId =  setTimeout(this.detectChanges.bind(this), 601);
    this.bodyPartChange.emit({
      selectedPath: this.selectedPath,
      bodyParts: [this.fullBodyName]
    });
  }

  private adjustView(params: any) {
    const routeViewName =  this.defaultViewName || params.viewName;
    const bodyPart = params.bodyPart;

    if (routeViewName) this.selectedPath[0] = routeViewName;

    this.perspectiveActiveName = this.selectedPath[1];

    if (bodyPart) {
      const path = this.findPath(bodyPart);

      this.onPerspectiveChange(path[1]);
      this.onBodyPartClicked(bodyPart);

    } else if (this.defaultZone && this.defaultZone !== this.fullBodyName) {
      const defaultPath = this.findPath(this.defaultZone);

      this.onPerspectiveChange(defaultPath[1]);
      // if path has sides (left right) click on the first one
      this.onBodyPartClicked(bodyPart || this.defaultBodyPart || (defaultPath[3] ? defaultPath[3][0] : defaultPath[2]));
    }
  }

  private getSelectedPath(path: MICA.BodyImage.SelectedPath,
                          _zone: MICA.BodyImage.SVGGroup,
                          value: string): MICA.BodyImage.SelectedPath {
    const selectedPath = path;

    if (_zone.groupName && selectedPath[2] === _zone.groupName) {
      // user is interacting with same pair pf parts
      selectedPath[3] = ~_.indexOf(selectedPath[3], value)
        ? _.without(selectedPath[3], value)
        : [...selectedPath[3], value];
    } else {
      // it's a new multipart area
      // assign all names in the zone
      selectedPath[3] = this.getZoneShapeNames(_zone);
    }

    if (this.defaultViewName) {
      selectedPath[0] = this.defaultViewName;
    }

    // select zone
    selectedPath[2] = selectedPath[3].length ? _zone.groupName || value : '';

    return selectedPath;
  }

  private getZoneShapeNames = (_zone: MICA.BodyImage.SVGGroup): string[] => _.map(_zone.shapes, sh => sh.name);

  private isMultipart = (_zone: MICA.BodyImage.SVGGroup) => _zone.shapes && _zone.shapes.length > 1;

  private setSelectedShapes(selectedPath: MICA.BodyImage.SelectedPath,
                            _zone: MICA.BodyImage.SVGGroup,
                            value: string) {
    const isMultipart = this.isMultipart(_zone);

    if (isMultipart) {
      // Manage selections when body part has left/right, upper/bottom or we are in a close up image (e.g.: mouth)
      // check if the part which has been clicked on is part of a group and already active
      const shapeSelectedIndex = _.indexOf(this.selectedShapes, value);

      if (~shapeSelectedIndex) {
        // remove the part from the group
        this.selectedShapes.splice(shapeSelectedIndex, 1);
      } else {
        // selected part is either on its own or it's unselected
        // so far groups can only have two (e.g.: ears), so remapping works in both cases
        this.selectedShapes = selectedPath[3];
      }
    } else {
      // manage single shape
      this.selectedShapes = [value];
    }
  }

  private checkLastZone(_zone: MICA.BodyImage.SVGGroup, value: string) {
    if (!_zone.isLast) {
      // trigger new zoom
      const shouldShiftOppositeBodySide = this.selectedShapes.length === 1 && this.selectedShapes[0] !== value;

      if (shouldShiftOppositeBodySide) {
        this.zoomedOnPart = this.selectedShapes[0];
      } else {
        this.zoomedOnPart = value;
      }
    } else {
      this.showMappings = true;
    }
  }

  private setZoomedPart(_zone: MICA.BodyImage.SVGGroup) {
    if (
      this.zoomedOnPart
      && this.isMultipart(_zone) && _zone.shapes
      && _zone.shapes.length === 2 && this.selectionBehaviour === 'select'
    ) {
      // check if zoom needs to shift for groups of part in which only the opposite side is selected
      // WARNING: This only works with left/right
      // There may be the need to implement upper/lower (only in isLast zones as the time of writing)
      const zoomMatch = this.zoomedOnPart.match(new RegExp(/right|left/, 'i'));

      if (zoomMatch) {
        const zoomedSide = zoomMatch[0];
        const regexpZoomSide = new RegExp(zoomedSide, 'i');
        const shouldShiftOppositeBodySide = this.selectedShapes.length === 1 && !regexpZoomSide.test(this.selectedShapes[0]);

        if (shouldShiftOppositeBodySide) {
          const oppositeSide = regexpZoomSide.test('right') ? 'Left' : 'Right';
          this.zoomedOnPart = this.zoomedOnPart.replace(regexpZoomSide, oppositeSide);
        }
      }
    }
  }

  private getParentGroupData(groupName: string, type: string, side: string): any {
    const foundParentGroupData = this.findParentGroupData(side, type, groupName);

    if (foundParentGroupData) {
      return foundParentGroupData;
    } else {
      // search other perspective
      const foundSide = this.perspectiveNames.find(name => name !== side) || '';
      const foundParentGrData = this.findParentGroupData(foundSide, type, groupName);

      if (foundParentGrData) {
        this.perspectiveActiveName = foundSide;
        return foundParentGrData;
      } else {
        return {
          shapeName: groupName,
          changeValue: false
        }
      }
    }
  }

  private findParentGroupData(perspective: string, type: string, groupName: string) {
    const svgMap = this.svgShapes[type][perspective];
    const svgMapNames = Object.keys(svgMap);

    for (let i = 0; i < svgMapNames.length; i++) {
      let svgMapName = svgMapNames[i];
      const svgShapes = svgMap[svgMapName];

      for (let j = 0; j < svgShapes.length; j++) {
        const svgShape = svgShapes[j];

        if ((svgShape.groupName && svgShape.groupName === groupName)
          || (svgShape.shapes || []).findIndex(shape => shape.name === groupName) > -1) {
          svgMapName = svgMapName.replace('Left', 'Right');

          if (svgMapName === 'Whole Body' && svgShape.shapes && svgShape.shapes.length) {
            return {
              shapeName: svgShape.shapes[0].name.replace('Left', 'Right'),
              changeValue: true
            };
          }

          return {
            shapeName: svgMapName,
            changeValue: false
          };
        }
      }
    }

    return null;
  };

  private triggerZoom(zone: any, _zone: any, value: string, selectedPath: MICA.BodyImage.SelectedPath) {
    let shapeName = '';
    let changeValue = false;

    if (!zone) {
      if (_zone.shapes && _zone.shapes.length) {
        const parentGroupData = this.getParentGroupData(value, selectedPath[0], selectedPath[1]);

        shapeName = parentGroupData.shapeName;
        changeValue = parentGroupData.changeValue;

        if (shapeName !== value) {
          this.zoomedOnPart = shapeName;
        }
      }
    }

    this.checkLastZone(_zone, changeValue ? shapeName : value);
    this.cd.detectChanges();
  }

  private clearTimeout() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }

  private detectChanges() {
    this.showMappings = true;
    this.cd.detectChanges();
  }

  /**
   * ZONE
   */

  private findPath(name: string): MICA.BodyImage.SelectedPath {
    const svg = <any>_.get(this.svgShapes, _.take(this.selectedPath, 2) as string[]);
    const path = _.reduce(
      svg,
      (resultPath, svgMap: MICA.BodyImage.SVGGroup[]) => {
        if (resultPath.length > 2)  {
          return resultPath;
        }

        // trying to find groupName by shapeName
        _.forEach(svgMap, group => {
          _.forEach(group.shapes, shape => {
            if (shape.name === name) {
              if (group.groupName) {
                resultPath.push(group.groupName, _.map(group.shapes, 'name'));
              } else {
                resultPath.push(shape.name, [shape.name]);
              }
            }
          });
          // safeguard if trying to find Path for groups like "Legs"
          // used in physical editor for finding symptom on scroll
          if (group.groupName === name && resultPath.length === 2) {
            resultPath.push(group.groupName, _.map(group.shapes, 'name'))
          }
        });

        return resultPath;
      },
      <any>_.take(this.selectedPath, 2)
    );

    return path;
  }

  private findZone(name: string): MICA.BodyImage.SVGGroup | undefined {
    let result: MICA.BodyImage.SVGGroup;
    const digger = (target: any): MICA.BodyImage.SVGGroup | undefined => {
      if (result) return result;
      if (target.shapes) {
        result = target.groupName === name
          ? target
          : _.some(target.shapes, { name }) ? target : undefined;
        return;
      }

      return _.reduce(target, (acc, obj) => {
        return digger(obj);
      },              undefined);
    };

    return digger(this.svgShapes);
  }

  /**
   * IMAGES AND SHAPES
   */

  shapeSelectedClass(shapeName: string, zone: MICA.BodyImage.SVGGroup): string {
    if (this.selectionBehaviour === 'pick') {
      return 'hoverable';
    }

    // check if it's selected
    const isSelected = ~_.indexOf(this.selectedShapes, shapeName);

    if (!isSelected) {
      const siblingsSelected = _.some(zone.shapes, sh => {
        return ~_.indexOf(this.selectedShapes, sh.name);
      });
      if (!siblingsSelected) {
        return 'hoverable';
      }
      return '';
    } else {
      return 'selected';
    }

    // check if shapes group has more than one (e.g.: eyes)
    // do not make other shapes hoverable when one is active
  }

  onBodyViewChange(view: string) {
    this.internalAnimationsOn = true;
    this.showMappings = false;
    this.selectedPath[0] = view;
    if (view === 'Whole Body') {
      this.selectedPath[0] = 'general';
      (this.selectedPath as any)[4] = 'true';
    }
    this.perspectiveActiveName = this.defaultPerspectiveName;
    this.internalAnimationsOn = false;
    this.cd.markForCheck();
  }

  onPerspectiveChangeEnd() {
    this.showMappings = true;
    this.cd.markForCheck();
  }

  onPerspectiveChange(name: string) {
    this.perspectiveActiveName = name;
    this.cd.markForCheck();
  }

  /**
   * PERSPECTIVE
   */

  private get perspectiveActiveName(): string {
    return this.selectedPath[1];
  }

  private set perspectiveActiveName(focusOnName: string) {
    // reorder perspectives
    const perspectives = _.clone(this.perspectiveNames);
    const oldCentralName = perspectives[1];
    const emptySpot = _.indexOf(perspectives, focusOnName);
    const oldCentral = this.perspectiveImg(oldCentralName);
    const newCentral = this.perspectiveImg(focusOnName);

    if (oldCentral && newCentral && oldCentral.name !== newCentral.name) {
      perspectives[emptySpot] = oldCentral.name;
      perspectives[this.activePerspectiveIndex] = newCentral.name;
    }

    this.zoomedOnPart = focusOnName;
    this.perspectiveNames = perspectives;
    this.selectedPath[1] = focusOnName;
    this.resetZoom();
    this.cd.detectChanges();
  }

  private perspectiveImg(name: string): MICA.BodyImage.Image | undefined {
    return _.find(this.bodyImages, bi => bi.name === name);
  }

  perspectiveAnimationState(name: string): string {
    switch (_.indexOf(this.perspectiveNames, name)) {
      case 0:
        return 'left';
      case 1:
        // show in centre or zoom to zone
        return this.zoomedOnPart === this.fullBodyName ? 'centre' : _.join([this.perspectiveActiveName, this.zoomedOnPart], '/');
      case 2:
        return 'right';
      default:
        throw Error('Unable to determine animation state');
    }
  }
}
