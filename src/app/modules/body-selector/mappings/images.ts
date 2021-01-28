import { environment } from '../../../../environments/environment';

let assetsUrl = 'assets/img/body/';
/* istanbul ignore if */
if (environment.production || environment.pilot) assetsUrl = '/MICA/' + assetsUrl;

export const svgDimensions: MICA.BodyImage.SVGConfig = {
  height: 600,
  width: 250,
  bodyWidth: 215,
  bodyHeight: 500,
  transform: {
    front: {
      translate: [0, 0]
    },
    back: {
      translate: [0, 0]
    },
    side: {
      translate: [0, 0]
    }
  }
};

export const muscle: MICA.BodyImage.Image[] = [
  {
    name: 'front',
    position: 1,
    href: assetsUrl + 'muscle/muscle-front.png',
    preserveAspectRatio: 'xMinYMin meet'
    // transform: {
    //   translate: [0, 0]
    // }
  },
  {
    name: 'back',
    position: 0,
    href: assetsUrl + 'muscle/muscle-back.png',
    preserveAspectRatio: 'xMinYMin meet'
    // transform: {
    //   translate: [0, 0]
    // }
  },
  // {
  //   name: "side",
  //   position: 2,
  //   href: assetsUrl + "muscle/muscle-side.png",
  //   preserveAspectRatio: "xMinYMin meet"
    // transform: {
    //   translate: [0, 0]
    // }
  // }
];

export const color: MICA.BodyImage.Image[] = [
  {
    name: 'front',
    position: 1,
    href: assetsUrl + 'external/external-front.png',
    preserveAspectRatio: 'xMinYMin meet'
    // transform: {
    //   translate: [0, 0]
    // }
  },
  {
    name: 'back',
    position: 0,
    href: assetsUrl + 'external/external-back.png',
    preserveAspectRatio: 'xMinYMin meet'
    // transform: {
    //   translate: [0, 0]
    // }
  },
  // {
  //   name: "side",
  //   position: 2,
  //   href: assetsUrl + "external/external-side.png",
  //   preserveAspectRatio: "xMinYMin meet"
    // transform: {
    //   translate: [0, 0]
    // }
  // }
];

export const bone: MICA.BodyImage.Image[] = [
  {
    name: 'front',
    position: 1,
    href: assetsUrl + 'bone/bone-front.jpg',
    preserveAspectRatio: 'xMinYMin meet'
  },
  {
    name: 'back',
    position: 0,
    href: assetsUrl + 'bone/bone-back.jpg',
    preserveAspectRatio: 'xMinYMin meet'
  }
];

export const viewImagesMap: MICA.BodyImage.View = {
  muscle: muscle,
  bone: bone,
  general: color,
  skin: color
};

const mouth: MICA.BodyImage.Image = {
  name: 'mouth',
  position: 1,
  href: assetsUrl + 'parts/mouth.png',
  preserveAspectRatio: 'xMinYMin meet',
  transform: 'translate(19, 132)'
};

const chest: MICA.BodyImage.Image = {
  name: 'chest',
  position: 1,
  href: assetsUrl + 'parts/chest.png',
  preserveAspectRatio: 'xMinYMin meet',
  width: 250,
  transform: 'translate(0, 180)'
};

export const physicalZoomedImages = {
  Mouth: mouth,
  Chest: chest
};
