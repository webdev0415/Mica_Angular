import { viewImagesMap, physicalZoomedImages } from "./../modules/body-selector/mappings/images";
import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { forkJoin } from "rxjs/observable/forkJoin";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class ImageLoadingService {

  constructor(private http: HttpClient) {
  }

  preloadBodyImages() {
    const imgSrcs = _.reduce(viewImagesMap, (imgs, v, k) => {
        return [...imgs, ..._.map(v, "href")];
      }, [] as string[]);
    const zoomImgSrcs = _.reduce(physicalZoomedImages, (imgs, v, k) => {
      return [...imgs, v.href];
    }, [] as string[]);

    return forkJoin(..._.map([...imgSrcs, ...zoomImgSrcs], img => this.http.get(img, {responseType: "blob"})));
  }

}
