export default abstract class View {
  private template: string;
  private renderTemplate: string;
  private container: HTMLElement;
  private htmlList: string[];

  constructor(containerId: string, template: string) {
    const containerEl = document.getElementById(containerId);

    if (!containerEl) throw "최상위 컨테이너가 없어 UI를 진행하지 못합니다.";

    this.container = containerEl;
    this.template = template;
    this.renderTemplate = template;
    this.htmlList = [];
  }

  protected updateView = () => {
    this.container.innerHTML = this.renderTemplate;
    this.renderTemplate = this.template;
  };

  protected addHtml(htmlString: string) {
    this.htmlList.push(htmlString);
  }

  protected getHtml() {
    const snapshot = this.htmlList.join("");
    this.clearHtmlList();
    return snapshot;
  }

  protected setTemplateData(key: string, val: string) {
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, val);
  }

  private clearHtmlList() {
    this.htmlList = [];
  }

  // 하위 자식 클래스가 필수적으로 구현 해야하는 함수 'abstract'
  abstract render(): void;
}
