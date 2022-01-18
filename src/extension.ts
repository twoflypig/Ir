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
    public provideDefinition(
        document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) 
        {
        console.log(position, token);
        const word =  document.getText(document.getWordRangeAtPosition(position));
        const txt =  document.getText();
        console.log("Get word", word);
        console.log('test:', /para\d+/.test(word));
        if (/para\d+/.test(word)) {
          const regexp2 = RegExp(`${word}`,'g');
          let searced = [...txt.matchAll(regexp2)];
          for (var i = 0; i < searced.length; i++ ){
            console.log("matched 0", Number(searced[i].index));
            let x = document.positionAt(Number(searced[i].index));
            console.log(`Matching the word ${regexp2}, find position is ${x.line}`);
            if (x.line !== position.line) {
              console.log(`Matchine at ${x}`);
              return new vscode.Location(vscode.Uri.file(document.fileName), x);
            }
          }
        } else if ( /\d+/.test(word)) {
          const regexp = RegExp(`%${word}\\(`,'g');
          let searced = [...txt.matchAll(regexp)];
          for (var i = 0; i < searced.length; i++ ){
            console.log("matched 0", Number(searced[i].index));
            let x = document.positionAt(Number(searced[i].index));
            console.log(`Matching the word ${regexp}, find position is ${x.line}`);
            if (x.line !== position.line) {
              console.log(`Matchine at ${x}`);
              return new vscode.Location(vscode.Uri.file(document.fileName), x);
            }
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
        const word =  document.getText(document.getWordRangeAtPosition(position));
        const txt =  document.getText();
        console.log("Get word", word);
        console.log('test:', /para\d+/.test(word));
        if (/para\d+/.test(word)) {
          const regexp2 = RegExp(`${word}`,'g');
          let searced = [...txt.matchAll(regexp2)];
          for (var i = 0; i < searced.length; i++ ){
            console.log("matched 0", Number(searced[i].index));
            let x = document.positionAt(Number(searced[i].index));
            console.log(`Matching the word ${regexp2}, find position is ${x.line}`);
            if (x.line !== position.line) {
              console.log(`Matchine at ${x}`);
              list.push(new vscode.Location(vscode.Uri.file(document.fileName), x));
            }
          }
        } else if ( /\d+/.test(word)) {
          const regexp = RegExp(`%${word}\\D`,'g');
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
