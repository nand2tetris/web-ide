import * as vscode from "vscode";

export function activateHdlView(context: vscode.ExtensionContext) {
  console.log("Registering HDL View");
  const provider = new HdlViewProvider(context.extensionUri);
  vscode.window.registerWebviewViewProvider(HdlViewProvider.viewType, provider);
}

class HdlViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "computron5k.hdlView";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      console.log(data);
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>HDL Panel</title>
			</head>
			<body>
        HDL Panel
			</body>
			</html>`;
  }
}
