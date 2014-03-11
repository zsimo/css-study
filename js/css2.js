/*jslint browser:true*/
/*global console:true,alert:true,confirm:true,CodeMirror:true,CSSOM:true,css:true,cssData:true,
    ActiveXObject:true,FormData:true */
// forin: true

// obj.style.transition = "transition: all " + myDuration + "s ease-in;";

// multiple transition separated dalla VIRGOLA
// transition: all 500ms ease-in, width 500ms ease-in 500ms;
// -webkit-transition:width 2s, height 2s, background-color 2s, -webkit-transform 2s;

// multiple transform separated dallo SPAZIO
// transform: rotate(200deg)  translateX(-300px);


//.default {
//  transform: translate(100px, 100px);
//  height: 100px;
//  width: 100px;
//  background-color: black;
//  z-index: 1;
//  transition: all 500ms ease-in;
//}
// .newState {
//  transform: perspective(20px) rotateX(45deg);
// }

(function (global) {

    "use strict";

    var CSS2 = (function () {

        var
            len,
            propertiesThatNeedPrefix = cssData.propertiesThatNeedPrefix,
            newStateTextArea,
//            newStateTextAreaContent,
            defaultTextArea,
//            defaultTextAreaContent,
            cursor,
            prefix = css.getPrefix("css"),
            target = document.getElementById("target"),
            newStateLabel = document.getElementById("newStateLabel"),
            databaseSelector = document.getElementById("databaseSelector"),
//            nameForTheDatabaseOfStyles,
            codeMirrorTextArea,
            codeMirrorOptions = {
                mode: "css",
                theme: "blackboard",
                extraKeys: {"Ctrl-Space": "autocomplete", "Shift-Cmd-/": "toggleComment"},
                tabSize: 2
            },
            defaultStyle = "\n.default {\n  -webkit-transform: translate(100px, 100px);\n  height: 100px;\n  " +
            "width: 100px;\n  border-radius: 2px;\n  background-color: black;\n  z-index: 1;\n  " +
            "-webkit-transition: -webkit-transform 500ms ease,\n      width 2000ms ease;\n}",
            newStateDefaultStyle = "/*prova*/\n.newState {\n  -webkit-transform: translate(200px, 200px);\n  width: 200px;\n}",
            cssRulesJson,

            // -webkit-transform: rotateY(89deg);

            parseRawText = function (rawCss) {
                var rule,
                    property,
                    value,
                    j,
                    i,
//                    outArray = [],
                    outObj = {},
                    temp,
                    selectorsArray = CSSOM.parse(rawCss).cssRules;
                for (i = 0; i < selectorsArray.length; i += 1) {
//                    console.log(selectorsArray[i].style);
                    rule = selectorsArray[i].style;
                    for (j = 0; j < rule.length; j += 1) {
                        property = rule[j];
                        value = rule[property];
                        temp = [property, value];
//                        outArray.push(temp);
                        outObj[property] = value;
                    }
                }
                return outObj;
            },

//            addPrefix = function (text, textArea) {
//                cursor = textArea.getSearchCursor("transform");
//                while (cursor.findNext()) {
//                    cursor.replace("-moz-transform");
//                    console.log("here");
//                }
//            },

            manuallyAddPrefixToTheProperty = function (property) {
                if (propertiesThatNeedPrefix.indexOf(property) !== -1) {
                    return prefix + property;
                }
                return property;
//                var i, len;
//                for (i = 0, len = propertiesThatNeedPrefix.length; i < len; i += 1) {
//                    if (propertiesThatNeedPrefix[i].indexOf(property) !== -1) {
//                        console.log(prefix + property);
//                        return prefix + property;
//                    }
//                }
//                return property;
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

            sendDataToTheServer = function (url, dataObject, callback) {

                var xhr, formData, key;

                try {
                    xhr = new XMLHttpRequest();
                } catch (e) {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                }

                // handle old browsers
                if (xhr === null) {
                    alert("Ajax not supported by your browser!");
                    return;
                }

                formData = new FormData();

//                for (key in dataObject) {
//                    if (dataObject.hasOwnProperty(key)) {
//                        formData.append(key, dataObject[key]);
//                    }
//                }
                formData.append("cssRules", dataObject);

                xhr.onreadystatechange = callback;

                xhr.open("POST", url, true);

                xhr.send(formData);

            },

            sendDataToTheServerCallback = function (httpRequestProgressEvent) {
                var xhr = httpRequestProgressEvent.currentTarget, jsonResponse;
                // only handle loaded requests
                if (xhr.readyState === 4) {
                    // display response if possible
                    if (xhr.status === 200) {

//                         console.log(xhr.responseText);

                        // jsonResponse = JSON.parse(xhr.responseText);
//                        console.log(jsonResponse.test);

                    } else {
                        console.log("Error with Ajax call!");
                    }
                }
            },

            injectStyleDataInTheSelector = function (selector, itemSelected) {
                var key, inputTag = "", selected = "";
//                for (key in localStorage) {
//                    if (localStorage.hasOwnProperty(key)) {
                for (key in cssRulesJson) {
                    if (cssRulesJson.hasOwnProperty(key)) {
                        if (itemSelected && key === itemSelected) {
                            // console.log(key + "  " +  itemSelected);
                            selected = " selected";
                        } else {
                            selected = "";
                        }
                        inputTag += '<option value="' + key + '"' + selected + '>' + key + '</option>';
                    }
                }
                selector.innerHTML = inputTag;
                // TODO poi sara il file su simonsacchi.com
                sendDataToTheServer("php/saveCssRulesToJson.php", JSON.stringify(cssRulesJson),
                                    sendDataToTheServerCallback);
            },


            extractNameOfTheCssForTheDatabaseFromAComment = function (rawText) {
                var start, stop;
                start = rawText.indexOf("/*");
                if (start !== -1) {
                    return rawText.substring(start + 2, rawText.indexOf("*/"));
                }
                return null;
            },

            storePermanentlyCssRules = function (styleName) {
                // FIXME localStorage
//                localStorage.setItem(styleName, defaultTextArea.getValue() + "&" + newStateTextArea.getValue());
                cssRulesJson[styleName] = defaultTextArea.getValue() + "&" + newStateTextArea.getValue();
                console.log("OK, style saved: " + styleName);
                injectStyleDataInTheSelector(databaseSelector, styleName);
            },

            saveTheStyle = function () {
                var nameInDefaultTextArea, nameInNewStateTextArea, styleName, styleNameAlreadyUsed = [], key;

                // 1. read the name of the style (the first commented line of both the text area)
                nameInDefaultTextArea = extractNameOfTheCssForTheDatabaseFromAComment(defaultTextArea.getValue());
                nameInNewStateTextArea = extractNameOfTheCssForTheDatabaseFromAComment(newStateTextArea.getValue());
//                console.log(nameInDefaultTextArea);
//                console.log(nameInNewStateTextArea);
                // 2. scegli quale nome usare
                // 2.1 errore se entrambi non sono validi
                if (!nameInDefaultTextArea && !nameInNewStateTextArea) {
                    alert("invalid style name");
                // 2.2 errore se i nomi sono diversi
                } else if (nameInDefaultTextArea && nameInNewStateTextArea &&
                           nameInDefaultTextArea !== nameInNewStateTextArea) {
                    alert("different style name. which one do you want to use?");
                } else {
                    if (nameInDefaultTextArea && !nameInNewStateTextArea) {
                        styleName = nameInDefaultTextArea;
                    } else if (!nameInDefaultTextArea && nameInNewStateTextArea) {
                        styleName = nameInNewStateTextArea;
                    }
                    if (styleName) {
                        // 3. recupera tutti i nomi gia salvati
                        // FIXME localStorage
                        for (key in cssRulesJson) {
                            if (cssRulesJson.hasOwnProperty(key)) {
                                styleNameAlreadyUsed.push(key);
                            }
                        }
                        // 4. controlla che il nuovo nome non sia gia stato usato
                        // TODO
                        if (styleNameAlreadyUsed.indexOf(styleName) === -1) {

                            storePermanentlyCssRules(styleName);

                        } else {
                            if (confirm("style already used, lo vuoi sovrascrivere?")) {

                                storePermanentlyCssRules(styleName);

                            }
                        }

                    }
                }
//                console.log("ERROR in saving the style");

            },

            readAndApplyStyles = function (event, obj) {
                var rawCss = event.getValue(),
                    styleObj = parseRawText(rawCss),
                    selector,
                    styleSheetNumber,
                    tempRule = "",
                    tempStyleName,
                    key;

                if (rawCss.trim()[1] === "d") {
                    selector = ".default";
                    styleSheetNumber = 3;
//                    defaultTextAreaContent = rawCss;
                } else {
                    selector = ".newState";
                    styleSheetNumber = 4;
//                    newStateTextAreaContent = rawCss;
                }

                if (document.styleSheets[styleSheetNumber].cssRules.length > 0) {
                    document.styleSheets[styleSheetNumber].deleteRule(0);
                }

                for (key in styleObj) {
                    if (styleObj.hasOwnProperty(key)) {
                        tempRule += manuallyAddPrefixToTheProperty(key) + ": " +
                            manuallyAddPrefixToTheValue(styleObj[key]) + ";";
//                        console.log(manuallyAddPrefixToTheValue(styleObj[key]));
                    }
                }

                css.setCssRule(document.styleSheets[styleSheetNumber], selector, tempRule);


//                tempStyleName = extractNameOfTheCssForTheDatabaseFromAComment(rawCss);
//                if (tempStyleName) {
//                    nameForTheDatabaseOfStyles = tempStyleName;
//                }


            },

            storeDefaultCssRulesInLocalStorage = function () {

                if (!localStorage.getItem("base")) {
                    var key;
//                    for (key in cssData.defaultSettingIndex2) {
//                        if (cssData.defaultSettingIndex2.hasOwnProperty(key)) {
//                            localStorage.setItem(cssData.defaultSettingIndex2[key][0], cssData.defaultSettingIndex2[key][1]);
//                        }
//                    }
                    for (key in cssRulesJson) {
                        if (cssRulesJson.hasOwnProperty(key)) {
//                            console.log(key);
//                            console.log(cssRulesJson[key]);
                            localStorage.setItem(key, cssRulesJson[key]);
                        }
                    }
                }
            },



            readJsonFile = function () {
                var xhr;
                try {
                    xhr = new XMLHttpRequest();
                } catch (e) {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                }
                if (xhr === null) {
                    alert("Ajax not supported by your browser!");
                    return;
                }

                xhr.open('GET', 'cssRules.json', true);
                xhr.onreadystatechange = function (event) {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try {
                                cssRulesJson = JSON.parse(xhr.responseText);
                                console.log(cssRulesJson);
                            } catch (error) {

                                console.log(error);
                            }

                            // storeDefaultCssRulesInLocalStorage();
                            injectStyleDataInTheSelector(databaseSelector);
                        }
                    }

                };
                xhr.send(null);

            },

            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
            //
            // CONSTRUCTURE
            //
            // /////////////////////////////////////////////////
            init = (function () {
//                data saved once
//                sendDataToTheServer("php/saveCssRulesToJson.php", JSON.stringify(localStorage),
//                                    sendDataToTheServerCallback);

                readJsonFile();

//                storeDefaultCssRulesInLocalStorage();
//                injectStyleDataInTheSelector(databaseSelector);

                document.getElementById("newStateSheet").innerHTML = newStateDefaultStyle;
                document.getElementById("newStateTextArea").innerHTML = newStateDefaultStyle;
                document.getElementById("defaultTextArea").innerHTML = defaultStyle;
                document.getElementById("defaultStateSheet").innerHTML = defaultStyle;

//                CodeMirror.commands.autocomplete = function(cm) {
//                    CodeMirror.showHint(cm, CodeMirror.hint.css);
//                };
//                CodeMirror.commands.comment = function(cm) {
//                    console.log("comment");
//                    cm.toggleComment();
//                };

                defaultTextArea = CodeMirror.fromTextArea(document.getElementById("defaultTextArea"),
                                                          codeMirrorOptions);
                defaultTextArea.on("change", readAndApplyStyles);

                newStateTextArea = CodeMirror.fromTextArea(document.getElementById("newStateTextArea"),
                                                           codeMirrorOptions);
                newStateTextArea.on("change", readAndApplyStyles);




//                console.log(document.styleSheets);

            }()),

            last = "last";


        // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
        //
        // LISTENERS
        //
        // ///////////////////////////////////////////////////////////////////

        document.getElementById("toggleButton").onclick = function (event) {
            target.classList.toggle("newState");
            if (target.classList.contains("newState")) {
                newStateLabel.innerHTML = ' newState"';
            } else {
                newStateLabel.innerHTML = '"';
            }

        };

        document.getElementById("saveButton").onclick = function (event) {

            saveTheStyle();

        };

        databaseSelector.onchange = function (event) {
            // FIXME localStorage
//            var dataStyleArray = localStorage.getItem(this.value).split("&");
            var dataStyleArray = cssRulesJson[this.value].split("&");
            defaultTextArea.setValue(dataStyleArray[0]);
            newStateTextArea.setValue(dataStyleArray[1]);
        };


        // define public interface
        return {
            last : last
        };

    }());

    global.CSS2 = CSS2;

}(this));

