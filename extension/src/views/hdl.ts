import * as vscode from "vscode";
import { hdl as HDL } from "../languages/index.js";

export function activateHdlView(context: vscode.ExtensionContext) {
  const provider = new HdlViewProvider(context.extensionUri);
  vscode.window.registerWebviewViewProvider(HdlViewProvider.viewType, provider);
}

class HdlViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "computron5k.hdlView";

  private _hdl = "";
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

    webviewView.webview.onDidReceiveMessage(
      (message: { nand2tetris: boolean; ready: boolean }) => {
        if (message.nand2tetris && message.ready) {
          this.updateHdl(vscode.window.activeTextEditor?.document);
        }
      }
    );

    webviewView.onDidChangeVisibility(() => {
      if (this._view?.visible !== true) {
        this.clearHdl();
      } else {
        this.updateHdl(vscode.window.activeTextEditor?.document);
      }
    });

    vscode.window.onDidChangeActiveTextEditor((e) => {
      this.updateHdl(e?.document);
    });

    vscode.workspace.onDidSaveTextDocument(async (document) => {
      this.updateHdl(document);
    });
  }

  clearHdl() {
    this._hdl = "";
  }

  async updateHdl(document?: vscode.TextDocument) {
    if (document?.languageId !== "hdl") return;
    const hdl = document.getText();
    if (this._hdl === hdl) {
      return;
    }
    const diagnostics = await HDL.getDiagnostics(document);
    if ((diagnostics[0] ?? ["", []])[1].length === 0) {
      this._view?.webview.postMessage({ nand2tetris: true, hdl });
      this._hdl = hdl;
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const stylesUri = this.getUri(webview, ["hdl", "styles.css"]);
    const scriptUri = this.getUri(webview, ["hdl", "main.js"]);

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
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
