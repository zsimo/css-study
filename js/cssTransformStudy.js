/*jslint browser:true*/
/*global console:true,alert:true,confirm:true,CodeMirror:true,CSSOM:true,css:true,cssData:true */
// forin: true


(function (global) {
    
    "use strict";
    
    var CssTransformStudy = (function () {
        
        var
            len,
            newStateTextArea,
            defaultTextArea,
            propertiesThatNeedPrefix = cssData.propertiesThatNeedPrefix,
            prefix = css.getPrefix("css"),
            matchTextAreaWithStyleSheet = {
                "01" : 3,
                "02" : 4,
                "03" : 5,
                "04" : 6,
                "05" : 7,
                "06" : 8
            },
            codeMirrorOptions = {
                mode: "css",
                theme: "blackboard",
                extraKeys: {"Ctrl-Space": "autocomplete", "Shift-Cmd-/": "toggleComment"},
                tabSize: 2
            },
//            codeMirrorHtmlOptions = {
//                mode: "html",
//                theme: "blackboard",
//                tabSize: 2
//            },
            textArea01,
            textArea02,
            textArea03,
            textArea04,
            textArea05,
            textArea06,

            manuallyAddPrefixToTheProperty = function (property) {
                if (propertiesThatNeedPrefix.indexOf(property) !== -1) {
                    return prefix + property;
                }
                return property;

            },
            manuallyAddPrefixToTheValue = function (value) {
                var i, len, tempValue;
                for (i = 0, len = propertiesThatNeedPrefix.length; i < len; i += 1) {
                    tempValue = propertiesThatNeedPrefix[i];
                    // non ce prefisso e il valore ha bisogno del prefisso
                    if (value.indexOf(prefix) === -1 && value.indexOf(tempValue) !== -1) {
                        return value.replace(tempValue, prefix + tempValue);
                    }
                }
                return value;
            },
            
            // input: propertyValue a string contains the pair property:value
            // es: height: 150px
//            addPrefixToPropertyValue = function (propertyValue) {
//                var i, len, out;
//                for (i = 0, len = propertiesThatNeedPrefix.length; i < len; i += 1) {
//                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
//                    // string	The total string being examined.
//                    // la funzione viene chiamata solo se viene trovata la parola
//                    out = propertyValue.replace(propertiesThatNeedPrefix[i], function (match, p1, p2, p3, offset, string) {
//                        console.log(match);
//                        console.log(p1);
//                        console.log(p2);
//                        console.log(p3);
//                        console.log(offset);
//                        console.log(string);
//                        console.log("****");
//                    });
//                }
//            },
            
            // propertyValue a string contains the pair property:value
            manuallyAddPrefixToThePropertyValue = function (propertyValue) {
                
                // array oa all the rules for a given selector
                // es: ["color: red", "top: 20px"]
               
                var rulesArray = propertyValue.split(";"),
                    property,
                    value,
                    propertyValueArray,
                    propertyValuePrefixed = "",
                    i,
                    len;
                
                // !!! -1 array ottenuto da split(";") restituisce l'ultimo elemento vuoto
                for (i = 0, len = rulesArray.length - 1; i < len; i += 1) {
                    
                    propertyValueArray = rulesArray[i].split(":");
                    property = propertyValueArray[0].trim();
                    value = propertyValueArray[1].trim();
                    propertyValuePrefixed += manuallyAddPrefixToTheProperty(property) +
                        ":" + value + ";";
                    
                }

//                console.log(propertyValuePrefixed);
//                return propertyValue;
                return propertyValuePrefixed;
            },
            
            // return an array of array
            // [["selector", "rules declaration"], [".myClass", "color: red; margin: 2px;"]]
            parseRawTextAndReturnArray = function (rawCss) {
                var outArray = [],
                    cssRules,
                    selector,
                    propertyValue,
                    i,
                    len;
//                console.log("============");
                cssRules = CSSOM.parse(rawCss).cssRules;
//                console.log(cssRules);
                
                for (i = 0, len = cssRules.length; i < len; i += 1) {
//                     console.log("prepertyVAlue: " + cssRules[i].style.cssText);
//                    propertyValue = manuallyAddPrefixToThePropertyValue(cssRules[i].style.cssText);
                    selector = cssRules[i].selectorText;
                    propertyValue = manuallyAddPrefixToThePropertyValue(cssRules[i].style.cssText);
                    outArray.push([selector, propertyValue]);
                }
                
                return outArray;
            },
           
            
            readAndApplyStyles = function (event, obj) {
                var rawCss = event.getValue(),
                    styleArray = parseRawTextAndReturnArray(rawCss),
                    i,
                    // 1. retrieve the id of the textArea
                    // 2. split it in an array and take the third element (the numeric part of the id)
                    // 3. pass the numeric part of the id in the object that match the textAreas whith the
                    //    styleSheet
                    styleSheetNumber = matchTextAreaWithStyleSheet[event.getTextArea().id.split("-")[2]];//3
                
//                console.log("here");
                
                for (i = 0; i < document.styleSheets[styleSheetNumber].cssRules.length; i += 1) {
                    document.styleSheets[styleSheetNumber].deleteRule(i);
                }
    
                for (i = 0; i < styleArray.length; i += 1) {
                    css.setCssRule(document.styleSheets[styleSheetNumber], styleArray[i][0], styleArray[i][1]);
                }

            },
            
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
            //
            // CONSTRUCTURE
            //
            // /////////////////////////////////////////////////
            init = (function () {
                
//                ROW 01
//                CodeMirror.fromTextArea(document.getElementById("html-text-area-01"),
//                                                          codeMirrorHtmlOptions);
                textArea01 = CodeMirror.fromTextArea(document.getElementById("text-area-01"),
                                                          codeMirrorOptions);
                readAndApplyStyles(textArea01);
                textArea01.on("change", readAndApplyStyles);
                
                
                textArea02 = CodeMirror.fromTextArea(document.getElementById("text-area-02"),
                                                          codeMirrorOptions);
                readAndApplyStyles(textArea02);
                textArea02.on("change", readAndApplyStyles);
                
                
//              ROW 02
                textArea03 = CodeMirror.fromTextArea(document.getElementById("text-area-03"),
                                                          codeMirrorOptions);
                readAndApplyStyles(textArea03);
                textArea03.on("change", readAndApplyStyles);
                
                
                textArea04 = CodeMirror.fromTextArea(document.getElementById("text-area-04"),
                                                          codeMirrorOptions);
                readAndApplyStyles(textArea04);
                textArea04.on("change", readAndApplyStyles);
                
                
//              ROW 03
                textArea05 = CodeMirror.fromTextArea(document.getElementById("text-area-05"),
                                                          codeMirrorOptions);
                readAndApplyStyles(textArea05);
                textArea05.on("change", readAndApplyStyles);
                
                textArea06 = CodeMirror.fromTextArea(document.getElementById("text-area-06"),
                                                          codeMirrorOptions);
                readAndApplyStyles(textArea06);
                textArea06.on("change", readAndApplyStyles);
                

                
                
            }()),
                
            last = "last";
        
        
        // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
        //
        // LISTENERS
        //
        // ///////////////////////////////////////////////////////////////////
        

        document.getElementById("button-01").onclick = function (event) {
            document.getElementById("inner-el-01").classList.toggle("active-01");
//            document.getElementById("inner-el-02").classList.toggle("active-02");
        };
        document.getElementById("button-02").onclick = function (event) {
            document.getElementById("inner-el-02").classList.toggle("active-02");
//            document.getElementById("inner-el-03").classList.toggle("active-03");
//            document.getElementById("inner-el-04").classList.toggle("active-04");
        };
        document.getElementById("button-03").onclick = function (event) {
            document.getElementById("inner-el-03").classList.toggle("active-03");
//            document.getElementById("inner-el-01").classList.toggle("active-01");
//            document.getElementById("inner-el-02").classList.toggle("active-02");
        };
        document.getElementById("button-04").onclick = function (event) {
//            document.getElementById("inner-el-03").classList.toggle("active-03");
            document.getElementById("inner-el-04").classList.toggle("active-04");
        };
        document.getElementById("button-05").onclick = function (event) {
            document.getElementById("inner-el-05").classList.toggle("active-05");
            document.getElementById("inner-inner-el-05").classList.toggle("active-inner-05");
        };
        document.getElementById("button-06").onclick = function (event) {
            document.getElementById("inner-el-06").classList.toggle("active-06");
            document.getElementById("inner-inner-el-06").classList.toggle("active-inner-06");
        };

        
        // define public interface
        return {
            last : last
        };
        
    }());
    
    global.CssTransformStudy = CssTransformStudy;
    
}(this));

