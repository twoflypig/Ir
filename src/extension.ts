// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { workspace, languages, window, commands, ExtensionContext, Disposable } from 'vscode';

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
      const referRegex = new RegExp(`\%${word}\\(`);
      if (referRegex.test(curTxt)) {
        return false;
      }
      return true;
    }

    searchParameters(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
      var lastPosition;
      console.log(position, token);
      var range = document.getWordRangeAtPosition(position);
      const word =  document.getText(document.getWordRangeAtPosition(position));
      const txt =  document.getText();
      const regexp = RegExp(`${word}`,'g');
      let searced = [...txt.matchAll(regexp)];
      const referRegex = new RegExp(`^\%${word}`);
      for (var i = 0; i < searced.length; i++ ){
        let x = document.positionAt(Number(searced[i].index));
        const txtLine = document.lineAt(x.line).text;
        console.log(`Test the txt with ${referRegex.test(txtLine)}`);
        if (referRegex.test(txtLine) || /kernel_graph/.test(txtLine)) {
          console.log("Creating the position");
          lastPosition = new vscode.Location(vscode.Uri.file(document.fileName), x);
        }
        if (x.line !== position.line) {
          //console.log(`Matchine at ${x}`);
        } else {
          console.log(`returned at ${lastPosition}`);
          return lastPosition;
        }
      }
    }

    searchOperators(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
      var lastPosition;
      console.log("Start in saechOperator", position, token);
      const word =  document.getText(document.getWordRangeAtPosition(position));
      const txt =  document.getText();
      const regexp = RegExp(`%${word}[\\(\\),]`,'g');
      let searced = [...txt.matchAll(regexp)];
      console.log("Got the word", word);
      const referRegex = new RegExp(`\%${word}\\(`);
      for (var i = 0; i < searced.length; i++ ){
        let x = document.positionAt(Number(searced[i].index));
        const txtLine = document.lineAt(x.line).text;
        console.log(`Test the txt with ${referRegex.test(txtLine)}`);
        if (referRegex.test(txtLine)) {
          console.log("Creating the position");
          lastPosition = new vscode.Location(vscode.Uri.file(document.fileName), x);
        }
        if (x.line !== position.line) {
          //console.log(`Matchine at ${x}`);
        } else {
          console.log(`returned at ${lastPosition}`);
          return lastPosition;
        }
      }
    }

    public provideDefinition(
        document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) 
        {
        var lastPosition;
        console.log(position, token);
        var range = document.getWordRangeAtPosition(position);
        const word =  document.getText(document.getWordRangeAtPosition(position));
        const txt =  document.getText();
        console.log("Get word", word);
        if (!this.needToSeach(document, position, token)) {
          return;
        }
        var regexp;
        // para13
        if (/para\d+/.test(word)) {
          console.log("Search params");
          return this.searchParameters(document, position, token);
        } else if (/\d+/.test(word)) {
          console.log("Search operators");
          return this.searchOperators(document, position, token);
        }
    }
}

class GoReferenceProvider implements vscode.ReferenceProvider {
  public provideReferences(
      document: vscode.TextDocument, position: vscode.Position,
      options: { includeDeclaration: boolean }, token: vscode.CancellationToken) {
        var list = [];
        console.log("provied running:", position, token);
        const word =  document.getText(document.getWordRangeAtPosition(position));
        const txt =  document.getText();
        console.log("Get word", word);
        var regexp;
        if (/para\d+/.test(word)) {
          regexp = RegExp(`${word}`,'g');
        } else if (/\d+/.test(word)) {
          regexp = RegExp(`%${word}\\D`,'g');
        } else if (/\%\d+/.test(word)) {
          regexp = RegExp(`%${word}\\D`,'g');
        }
        if (regexp) {
          let searced = [...txt.matchAll(regexp)];
          for (var i = 0; i < searced.length; i++ ){
            console.log("matched 0", Number(searced[i].index));
            let x = document.positionAt(Number(searced[i].index));
            console.log(`Matching the word ${regexp}, find position is ${x.line}`);
            if (x.line !== position.line) {
              console.log(`Matchine at ${x}`);
              list.push(new vscode.Location(vscode.Uri.file(document.fileName), x));
            }
          }
        }
        console.log("Returned", list);
        return list;
  }
}


// this method is called when your extension is deactivated
export function deactivate() {}
