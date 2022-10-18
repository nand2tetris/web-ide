import * as vscode from "vscode";

export function activateHdlView(context: vscode.ExtensionContext) {
  console.log("Registering HDL View");
  const provider = new HdlViewProvider(context.extensionUri);
  vscode.window.registerWebviewViewProvider(HdlViewProvider.viewType, provider);
}

class HdlViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "computron5k.hdlView";

  private _view?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      console.log(data);
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const stylesUri = this.getUri(webview, ["hdl", "main.css"]);
    const scriptUri = this.getUri(webview, ["hdl", "main.js"]);

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <!--<link rel="stylesheet" type="text/css" href="${stylesUri}">-->
          <title>HDL - NAND2Tetris</title>
        </head>
        <body>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div id="root"></div>
          <script src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  private getUri(webview: vscode.Webview, pathList: string[]) {
    return webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "out", "views", ...pathList)
    );
  }
}
