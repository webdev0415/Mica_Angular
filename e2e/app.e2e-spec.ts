import { MICAPage } from './app.po';

describe('mica App', function() {
  let page: MICAPage;

  beforeEach(() => {
    page = new MICAPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
