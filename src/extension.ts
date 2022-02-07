// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { StreamPriorityOptions } from 'http2';
import { kill, listenerCount } from 'process';
import * as vscode from 'vscode';
import { workspace, languages, window, commands, ExtensionContext, Disposable } from 'vscode';
let myStatusBarItem: vscode.StatusBarItem;

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


	// register a command that is invoked when the status bar
	// item is selected
	const myCommandId = 'sample.showSelectionCount';
	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, async () => {
		const map = getUniqueOperators(vscode.window.activeTextEditor);
    let keys = Array.from(map).sort(function (a, b){return b[1] - a[1]});
    var log = "Opeator\tCounts\n";
    for (var i=0; i < keys.length; i++) {
      log += `${keys[i][0]}\t${keys[i][1]}\n`;
    }
    const curPath = vscode.window.activeTextEditor?.document.uri.path;
    vscode.window.activeTextEditor?.document.uri.with
    let uri = vscode.Uri.parse('untitled:'+ curPath + 'mp');
    const doc = await vscode.workspace.openTextDocument(uri);
		var newDoc = vscode.window.showTextDocument(doc, {preview: false});
    (await newDoc).edit(edit=> { 
      edit.insert(new vscode.Position(0, 0), log)
    });
    
	}));

	// create a new status bar item that we can now manage
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100000);
	myStatusBarItem.command = myCommandId;
	context.subscriptions.push(myStatusBarItem);

	// register some listener that make sure the status bar 
	// item always up-to-date
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem));

	// update status bar item once at start
	updateStatusBarItem();
    
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


function updateStatusBarItem(): void {
	const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
  var message = "$(megaphone) ";
  if (n[1] !== 0) {
    message +=  `${n[1]} kernel_graph(s) `;
  } 
  if (n[0] !==0){
    message +=  `${n[0]} operators(s)`;
  }
  myStatusBarItem.text = message;
  if (n[0]+n[1]  > 0){
    myStatusBarItem.show();
  } else {
    myStatusBarItem.hide();
  }
	
}

function getNumberOfSelectedLines(editor: vscode.TextEditor | undefined): number[] {
  const txt = editor?.document.getText();
  var kernelGraphs = 0;
  var operatiorNums = 0;
  if (txt) {
    // compute the total operators
    const regex = new RegExp(`\=\\s(\[A-Za-z]+)`, 'g'); 
    const res = [...txt.matchAll(regex)];
    // compute the total kernel_graphs
    const regex2 = new RegExp(`#Total subgraph : (\\d+)`, 'g'); 
    const res2 = [...txt.matchAll(regex2)];
    console.log("res:", res.length);
    if (res){
      operatiorNums = res.length;
    }
    if (res2) {
      kernelGraphs = parseInt(res2[0][1]);
    }
    return [operatiorNums, kernelGraphs];
  }
  return [0, 0];
}


function getUniqueOperators(editor: vscode.TextEditor | undefined): Map<String, number> {
  const txt = editor?.document.getText();
  var map = new Map<String, number>();
  if (txt) {
    // compute the total operators
    const regex = new RegExp(`\=\\s(\[A-Za-z]+)`, 'g'); 
    const res = [...txt.matchAll(regex)];
    for (var i = 0; i < res.length; i++ ){
      const count = map.get(res[i][1]);
      if (count){
        map.set(res[i][1], count + 1);
      } else {
        map.set(res[i][1], 1);
      }
     
    }
  }
  return map;
}


// this method is called when your extension is deactivated
export function deactivate() {}
