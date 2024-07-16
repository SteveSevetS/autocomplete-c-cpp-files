"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * defines a .c or .cpp header that defines
 * @field namespace is the namespace name
 * @field class is the name of the class
 * @field includes is the array that contains the headers included
 * @field methods is the array that contains the methods signatures
 */
class header {
    constructor() {
        this.includes = new Array();
        this.methods = new Array();
    }
}
exports.header = header;
/**
 * parses the C/C++ header file
 * @param fileContent string that contains the file content divided by \n
 * @returns return a header instance that contanis the file parsed file
 */
function parse(fileContent) {
    let h = new header();
    let commentBlock = false;
    let bracketsCount = 0; //cout the number of { } to dertermine if a class ends
    let arrayFileContent = fileContent.split('\n');
    let temp;
    for (let i = 0; i < arrayFileContent.length; i++) {
        temp = arrayFileContent[i].trimLeft();
        if (lineIsComment(temp)) {
            commentBlock = temp.startsWith('/*') ? true : commentBlock;
        }
        if (commentBlock || lineIsComment(temp)) {
            commentBlock = temp.includes('*/') ? false : commentBlock;
        }
        else {
            if (bracketsCount <= 1 || (bracketsCount <= 2 && h.namespace)) {
                if (lineHasOpenBracket(temp)) {
                    bracketsCount++;
                }
                if (lineHasCloseBracket(temp)) {
                    bracketsCount--;
                }
                if (lineIsMain(temp)) {
                    i = arrayFileContent.length;
                }
                if (lineIsInclude(temp)) {
                    h.includes.push(temp);
                }
                if (lineIsMethodSignature(temp)) {
                    if (bracketsCount == 0 || (bracketsCount == 1 && h.namespace)) {
                        h.methods.push(formatMethodsignature(temp.split(';')[0], undefined));
                    }
                    else {
                        h.methods.push(formatMethodsignature(temp.split(';')[0], h.class));
                    }
                }
                if (lineIsClass(temp)) {
                    h.class = temp.split(' ')[1].trim();
                }
                if (lineIsNamespace(temp)) {
                    temp += temp.includes('{') ? '' : '{';
                    h.namespace = temp;
                }
            }
            else {
                if (lineHasOpenBracket(temp)) {
                    bracketsCount++;
                }
                if (lineHasCloseBracket(temp)) {
                    bracketsCount--;
                }
            }
        }
    }
    return h;
}
exports.parse = parse;
/**
 *
 * @param methodSignature the string contains the method signature to be parsed
 * @param className optional parameter that contains the class name to be added before the function name
 *
 * @returns return a string that contains the formatted method signature
 */
function formatMethodsignature(methodSignature, className) {
    let arrayMethodSignature = methodSignature.split('(');
    let arrayMethodSignature2 = arrayMethodSignature[0].split(' ');
    let formattedMethodSignature = '';
    if (className) {
        if (arrayMethodSignature2.length > 1) {
            for (let i = 0; i <= arrayMethodSignature2.length - 2; i++) {
                formattedMethodSignature += arrayMethodSignature2[i] + ' ';
            }
        }
        formattedMethodSignature += `${className}::${arrayMethodSignature2[arrayMethodSignature2.length - 1]}`;
        for (let i = 1; i < arrayMethodSignature.length; i++) {
            formattedMethodSignature += '(' + `${arrayMethodSignature[i]}`;
        }
    }
    else {
        formattedMethodSignature = methodSignature;
    }
    return formattedMethodSignature;
}
function indent(methodSignature, indentationStyle, tab) {
    let separator = ' ';
    if (indentationStyle == "K&R")
        separator = ' ';
    if (indentationStyle == "Allman")
        separator = '\n';
    if (!indentationStyle)
        separator = ' ';
    return tab ? `\n\t${methodSignature}${separator}\t{\n\t\t\n\t}\n` : `\n${methodSignature}${separator}{\n\t\n}\n`;
}
exports.indent = indent;
function fileIsMain(lines) {
    let response = false;
    for (let i = 0; i < lines.length; i++) {
        if (lineIsMain(lines[i])) {
            response = true;
            i = lines.length;
        }
    }
    return response;
}
exports.fileIsMain = fileIsMain;
function lineIsInclude(line) {
    return line.startsWith('#include');
}
function lineIsMethodSignature(line) {
    return line.includes(');') && !(line.startsWith('typedef'));
}
function lineIsClass(line) {
    return line.startsWith('class');
}
function lineIsNamespace(line) {
    return line.startsWith('namespace');
}
function lineIsComment(line) {
    return line.startsWith('/*') || line.startsWith('//') || line.startsWith('*');
}
function lineIsMain(line) {
    return line.includes('main');
}
function lineHasOpenBracket(line) {
    return line.includes('{');
}
function lineHasCloseBracket(line) {
    return line.includes('}');
}
//# sourceMappingURL=parse.js.map