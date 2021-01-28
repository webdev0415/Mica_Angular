import { KeysPipe } from './keys.pipe';
import { NgModule } from '@angular/core';
import { TitleCasePipe } from './title-case.pipe';
import { PascalCasePipe } from './pascal-case.pipe';
import { CamelCasePipe } from './camel-case.pipe';
import { CorrectSpellingPipe } from './correct-spelling.pipe';
import { OptionNamePipe } from './option-name.pipe';
import { OrderByPipe } from './order-by.pipe';
import { GroupSortPipe } from './group-sort.pipe';
import { SortByPipe } from './sort-by.pipe';
import { PolicyFormatPipe } from './policy-format.pipe';

@NgModule({
  declarations: [
    TitleCasePipe,
    PascalCasePipe,
    CamelCasePipe,
    KeysPipe,
    CorrectSpellingPipe,
    OptionNamePipe,
    OrderByPipe,
    GroupSortPipe,
    SortByPipe,
    PolicyFormatPipe
  ],
  providers: [
    TitleCasePipe,
    PascalCasePipe,
    CamelCasePipe,
    KeysPipe,
    CorrectSpellingPipe
  ],
  exports: [
    TitleCasePipe,
    PascalCasePipe,
    CamelCasePipe,
    KeysPipe,
    CorrectSpellingPipe,
    OptionNamePipe,
    OrderByPipe,
    GroupSortPipe,
    SortByPipe,
    PolicyFormatPipe
  ]
})
export class PipesModule {
}
