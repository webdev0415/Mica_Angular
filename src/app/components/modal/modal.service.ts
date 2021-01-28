/**
 * Created by sergeyyudintsev on 18.08.17.
 */
import {
  Injectable,
  ComponentFactoryResolver,
  ComponentFactory,
  ApplicationRef,
  ComponentRef,
  EmbeddedViewRef, Injector
} from "@angular/core";
import { Subject } from "rxjs";
import { ModalComponent } from "./modal.component";


@Injectable()
export class ModalService {

  private isClosing = false;

  constructor(private resolver: ComponentFactoryResolver,
              private appRef: ApplicationRef) {}

  private createComponent(component: any): ComponentRef<any> {
    const factory: ComponentFactory<any> = this.resolver.resolveComponentFactory(component);
    const injector = Injector.create({ providers: [] });
    return factory.create(injector);
  }

  private getComponentNode(componentRef: ComponentRef<any>): HTMLElement {
    return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
  }

  open(component: any): ComponentRef<any> {
    const modalComponentRef: ComponentRef<ModalComponent> = this.createComponent(ModalComponent);
    const closeEvent: Subject<any> = new Subject();

    const rootNode = this.getComponentNode(this.appRef.components[0]);
    const modalComponentNode = this.getComponentNode(modalComponentRef);

    const closeModal = (result: any): void => {
      this.isClosing = true;
      modalComponentRef.destroy();
      contentComponentRef.instance.onModalClose.next(result);
      this.isClosing = false;
      const appInstance = this.appRef.components[0] || {changeDetectorRef: {detectChanges: () => {}}};
      appInstance.changeDetectorRef.detectChanges();
    };

    const contentComponentRef = this.createComponent(component);
    modalComponentRef.instance.content = contentComponentRef;

    contentComponentRef.instance.closeModal = closeModal;
    contentComponentRef.instance.onModalClose = closeEvent;

    modalComponentRef.instance.closeModal = closeModal;

    this.appRef.attachView(modalComponentRef.hostView);
    modalComponentRef.onDestroy(() => {
      if (!this.isClosing) closeEvent.next(); // complete
      this.appRef.detachView(modalComponentRef.hostView);
    });

    rootNode.appendChild(modalComponentNode);
    modalComponentRef.changeDetectorRef.detectChanges();
    return contentComponentRef;
  }
}
