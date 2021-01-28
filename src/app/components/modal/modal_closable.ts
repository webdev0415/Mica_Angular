/**
 * Created by sergeyyudintsev on 04.09.17.
 */
import {Input} from "@angular/core";
import {Subject} from "rxjs";

export class ModalClosable {
  closeModal: Function;
  onModalClose: Subject<any>;
}
