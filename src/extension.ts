// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { StreamPriorityOptions } from 'http2';
import { listenerCount } from 'process';
import * as vscode from 'vscode';
import { workspace, languages, window, commands, ExtensionContext, Disposable } from 'vscode';


class DifinitionFinder
{
    fuzyString = "";
    referString = "";

    constructor(fuzyString:string, referString:string) {
      this.fuzyString = fuzyString;
      this.referString = referString;
    }
    /*
     *
     * definitionFind
     */
    public definitionFind(word:string, txt:string, document:vscode.TextDocument, position:vscode.Position) {
      var lastPosition;
      const regexp = RegExp(this.fuzyString,'g');
      let searced = [...txt.matchAll(regexp)];
      const referRegex = new RegExp(this.referString);
      for (var i = 0; i < searced.length; i++ ){
        let x = document.positionAt(Number(searced[i].index));
        const txtLine = document.lineAt(x.line).text;
        if (referRegex.test(txtLine)) {
          lastPosition = new vscode.Location(vscode.Uri.file(document.fileName), x);
        }
        if (x.line !== position.line) {
          //console.log(`Matchine at ${x}`);
        } else {
          return lastPosition;
        }
      }
      if (lastPosition) {
        return lastPosition;
      }
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "helloworld-sample" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand('ir.helloWorld', () => {
  //   // The code you place here will be executed every time your command is executed

  //   // Display a message box to the user
  //   vscode.window.showInformationMessage('Hello World!');
  // });

  // context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(["ir"], new GoDefinitionProvider()));
  context.subscriptions.push(
    vscode.languages.registerReferenceProvider(["ir"], new GoReferenceProvider()));
    
}

// vscode.languages.registerHoverProvider('ir', {
//     provideHover(document, position, token) {
//       return {
//         contents: ['Hover Content']
//       };
//     }
// });


class GoDefinitionProvider implements vscode.DefinitionProvider {

    needToSeach(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken){
      // if the user click the %93 = xxx, so no need to search again
      const curTxt = document.lineAt(position.line).text;
      const word =  document.getText(document.getWordRangeAtPosition(position));
      const referRegex = new RegExp(`\%${word}\\(\S`);
      if (referRegex.test(curTxt)) {
        return false;
      }
      return true;
    }

    public provideDefinition(
        document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) 
        {
        console.log(position, token);
        const word =  document.getText(document.getWordRangeAtPosition(position));
        const txt =  document.getText();
        console.log("Get word", word);
        if (!this.needToSeach(document, position, token)) {
          console.log("The word", word, " do not need to search");
          return;
        }
        // para13
        if (/para\d+/.test(word)) {
          console.log("Search params");
          const finder = new DifinitionFinder(`${word}`, `^\%${word}`);
          const res = finder.definitionFind(word, txt, document, position);
          return res;
        } else if (/\d+/.test(word)) {
          console.log("Search operators such as %3 = ");
          const finder2 = new DifinitionFinder(`%${word} [=:\\(]`, `%${word} [=:]`);
          const res2 = finder2.definitionFind(word, txt, document, position);
          if (res2){
            
            return res2;
          }
          console.log("Return the searched results：", res2);

          console.log("Search operators");
          const finder = new DifinitionFinder(`%${word}[\\(\\),]`, `\%${word}\\(`);
          const res = finder.definitionFind(word, txt, document, position);
          if (res) {
            return res;
          }

        }
    }
}

class GoReferenceProvider implements vscode.ReferenceProvider {

  public provideReferences(
      document: vscode.TextDocument, position: vscode.Position,
      options: { includeDeclaration: boolean }, token: vscode.CancellationToken) {
        var list = [];
        console.log("provied running:", position, token);
        const word =  document.getText(document.getWordRangeAtPosition(position, ));
        const txt =  document.getText();
        console.log("Get word", word);
        var regexp;
        if (/para\d+/.test(word)) {
          regexp = RegExp(`${word}`,'g');
        } else if (/\d+/.test(word)) {
          regexp = RegExp(`%${word}\\D`,'g');
        } else if (/\%\d+/.test(word)) {
          regexp = RegExp(`%${word}\\D`,'g');
        } else {
          regexp = RegExp(`${word}\\(`, 'g');
        }
        if (regexp) {
          let searced = [...txt.matchAll(regexp)];
          for (var i = 0; i < searced.length; i++ ){
            let x = document.positionAt(Number(searced[i].index));
            if (x.line !== position.line) {
              console.log(`Matchine at ${x}`);
              list.push(new vscode.Location(vscode.Uri.file(document.fileName), x));
            }
          }
        }
        return list;
  }
}


// this method is called when your extension is deactivated
export function deactivate() {}
