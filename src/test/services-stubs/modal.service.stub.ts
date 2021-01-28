/**
 * Created by sergeyyudintsev on 02/03/2018.
 */
import {ComponentFactory, ComponentFactoryResolver, ComponentRef, Injectable, Injector, ReflectiveInjector} from "@angular/core";
import {Subject} from "rxjs";
@Injectable()
export class ModalServiceStub {
  private _contentComponentRef: ComponentRef<any>;
  public closeEvent: Subject<any> = new Subject();

  constructor(private _resolver: ComponentFactoryResolver,
              private _injector: Injector) {
  }
  private _createComponent(component: any): ComponentRef<any> {
    const factory: ComponentFactory<any> = this._resolver.resolveComponentFactory(component);
    const injector = ReflectiveInjector.fromResolvedProviders([]);
    return factory.create(injector);
  }

  open(component: any): ComponentRef<any> {
    const contentRef = this._createComponent(component);
    const closeModal = (res: any): void => {
      this.close(res);
    };
    contentRef.instance.closeModal = closeModal;
    contentRef.instance.onModalClose = this.closeEvent;
    this._contentComponentRef = contentRef;
    return contentRef;

  }

  close(res: any) {
    this._contentComponentRef.instance.onModalClose.next(res);
  }
}
