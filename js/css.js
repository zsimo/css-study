






/*jslint browser:true*/
/*global cssData:true,Autocomplete:true,Autocomplete2:true,console:true,alert:true,Event:true,css:true */
// forin: true

// obj.style.transition = "transition: all " + myDuration + "s ease-in;";

// NOTE Autocomplete2 constructor
(function (global) {
    
    "use strict";
    
    var Autocomplete2 = function (textInput, dataInput, prefix) {
        
        var
            data,
            options = {},
            arrayOfVisibleOptions = [],
            input,
            container,
            i,
            id,
            totalNumberOfOptions,
            howManyVisibleCounter,
            elementSelectedIndex,
            
            // double invocation
            // use addf(3)(4) -> 7
            // douglas crockford
            addf = function (x) {
                return function (y) {
                    return x + y;
                };
            },
            // FUNCTIONS
            addPrefix = function (dataArray) {
                for (i = 0; i < dataArray.length; i += 1) {
                    if (cssData.propertiesThatNeedPrefix.indexOf(dataArray[i]) !== -1) {
                        dataArray[i] = css.getPrefix("css") + dataArray[i];
                    }
                }
                return dataArray;
            },
            buildAutocompleteContent = function (index, inputValue) {
                return '<div id="' + index + id + '" class="singleProperty hide" val>' + inputValue + '</div>';
            },
            // once the options are inserted in the dom
            // memorize the reference to them
            cacheDomReferences = function () {
				for (i = 0; i < totalNumberOfOptions; i += 1) {
					options[i].domReference = document.getElementById(i + id);
                }
//                console.log(options);
			},
            // http://stackoverflow.com/questions/4793604/how-to-do-insert-after-in-javascript-without-using-a-library
            insertAfter = function (referenceNode, newNode) {
                referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
            },
            // bind the data to the options container
            setData = function (dataInput, prefix) {
                if (addPrefix) {
                    data = addPrefix(dataInput.sort());
                } else {
                    data = dataInput.sort();
                }
                var autocompleteContent = "";
                for (i = 0, totalNumberOfOptions = data.length; i < totalNumberOfOptions; i += 1) {
					options[i] = {
						"element" : data[i],
						"visible" : false
					};
					autocompleteContent += buildAutocompleteContent(i, data[i]);
				}
                container.innerHTML = autocompleteContent;
                cacheDomReferences();
//                console.log(options);
            },
            // for debug, return the options object
            getOptions = function () {
                return options;
            },
            // COSTRUTTORE
            init = (function () {
                input = css.getElement(textInput);
                // create and append after the text input the div 
                // that will contain all the options
                container = document.createElement("div");
                id = input.id;
                container.id = id + "Autocomplete";
                insertAfter(input, container);
//                console.log(input.);
                if (dataInput) {
                    setData(dataInput, prefix);
                }
               
            }()),
            escapeParentesis = function (input) {
                input = input.replace("(", "%28");
                return input.replace(")", "%29");
            },
            // *********************************************************************************
            // given the text in the text field, hide show the properties that contain that text
            // **********************************************************************************
			filter = function (input) {
				var temp,
                    firstHover = false;
                arrayOfVisibleOptions = [];
				for (i = 0; i < totalNumberOfOptions; i += 1) {
                    temp = options[i];
//                    input = input.replace("(", "%28");
//                    input = input.replace(")", "%29");
//                    console.log(input);
//					if (temp.element.search(escapeParentesis(input)) === -1) { // prima era match
                    if (temp.element.indexOf(input) === -1) {
                        temp.domReference.classList.add("hide");
                        temp.visible = false;
                    } else {
                        temp.domReference.classList.remove("hide");
                        temp.visible = true;
                        arrayOfVisibleOptions.push(i);
                        if (!firstHover) {
                            // appena aperto pannello opzioni, selezionata la prima
                            elementSelectedIndex = 0;
                            temp.domReference.classList.add("hover");
                            firstHover = true;
                        } else {
                            temp.domReference.classList.remove("hover");
                        }
                    }
				}
                howManyVisibleCounter = arrayOfVisibleOptions.length;
//                console.log(howManyVisibleCounter);
			},
            changeElementSelectedIndex = function (direction) {
                
//                console.log(howManyVisibleCounter);
                if (direction === "UP") {
                    elementSelectedIndex -= 1;
                } else { // DOWN
                    elementSelectedIndex += 1;
                }
//                console.log(elementSelectedIndex);
                if (elementSelectedIndex < 0) {
                    elementSelectedIndex = howManyVisibleCounter - 1;
                } else if (elementSelectedIndex >= howManyVisibleCounter) {
                    elementSelectedIndex = 0;
                }
//                console.log(elementSelectedIndex);
            },
            // *****************************************
            // http://davidwalsh.name/caret-end
            // *****************************************
            // optional helper function
            moveCursorToEnd = function (el) {
                if (typeof el.selectionStart === "number") {
                    el.selectionStart = el.selectionEnd = el.value.length;
                } else if (typeof el.createTextRange !== "undefined") {
                    el.focus();
                    var range = el.createTextRange();
                    range.collapse(false);
                    range.select();
                }
            },
            // **************************************************
            // move UP and DOWN the selections of the options
            // **************************************************
            moveTheSelection = function (direction) {
                //+++
                if (howManyVisibleCounter) {
                    changeElementSelectedIndex(direction);
//                    console.log(elementSelectedIndex);
                    var counter = 0;
                    for (i = 0; i < totalNumberOfOptions; i += 1) {
                        if (options[i].visible) {
                            if (counter === elementSelectedIndex) {
                                options[i].domReference.classList.add("hover");
                            } else {
                                options[i].domReference.classList.remove("hover");
                            }
                            counter += 1;
                        }
                    }
                }
            },
            // hide all the options
			hideAll = function () {
				for (i = 0; i < totalNumberOfOptions; i += 1) {
                    options[i].domReference.classList.add("hide");
                    options[i].domReference.classList.remove("hover");
                    options[i].visible = false;
				}
//                console.log(arrayOfVisibleOptions);
                arrayOfVisibleOptions = [];
                elementSelectedIndex = 0;
			},
            getPropertySelected = function () {
                if (options[arrayOfVisibleOptions[elementSelectedIndex]]) {
                    return options[arrayOfVisibleOptions[elementSelectedIndex]].element;
                } else {
                    return "";
                }
                
            },
                
            last = "last";

        
        // define public interface
        return {
            filter : filter,
            getOptions : getOptions,
            getPropertySelected : getPropertySelected,
            hideAll : hideAll,
            moveCursorToEnd : moveCursorToEnd,
            moveTheSelection : moveTheSelection,
            setData : setData
        };
        
    };
    
    global.Autocomplete2 = Autocomplete2;
    
}(this));




(function (global) {
    
    "use strict";
    
    var CssApp = (function () {
        
//        var getElement = document.getElementById;
        var
            // DOM elements
//            autocompleteProperties = document.getElementById("autocompleteProperties"),
            textInputProperties = document.getElementById("textInputProperties"),
            textInputValues = document.getElementById("textInputValues"),
            propertyDiv = document.getElementById("propertyDiv"),
            valueDiv = document.getElementById("valueDiv"),
            target = document.getElementById("target"),
            targetStyle = target.style,
            cssRulesContainer = document.getElementById("cssRules"),
            last,
            propertiesAutocomplete,
            valuesAutocomplete,
            activeTextInput,
            
            cssRulesObject = (function () {
                var
                    counter = 0,
                    list = {},
                    getCounter = function () {
                        return counter;
                    },
                    addOne = function () {
                        var ruleId = textInputProperties.value,
                            rule = document.createElement("li");
                        // rimuovi se gia presente
                        if (list.hasOwnProperty(ruleId)) {
                            cssRulesContainer.removeChild(document.getElementById(ruleId));
                        }
                        rule.className = "list-group-item";
                        rule.id = ruleId;
                        rule.innerHTML = ruleId + ": " + textInputValues.value;
                        cssRulesContainer.insertBefore(rule, cssRulesContainer.firstChild);
                        list[ruleId] = textInputValues.value;
                        counter += 1;
                        console.log(list);
                    };
                
                return {
                    addOne : addOne,
                    getCounter : getCounter
                };
            
            }()),
            
            // **************************************************
            // callBack at the end of the animation of the target
            // add new rule in the right comulumn
            // **************************************************
            targetTransitionEnd = function (event) {
                cssRulesObject.addOne();
            },
                
//            setPropertyValue = function (domElement, property_value) {
//                var propertyValueArray = property_value.split(":");
//                domElement.style.setProperty(propertyValueArray[0].trim(), propertyValueArray[1].trim());
//            },

            // NOTE CssApp init
            init = (function () {

//                autocompleteProperties.addEventListener("autocompleteCreated", Autocomplete.cacheDomReferences);
//				autocompleteProperties.innerHTML = Autocomplete.init("textInputProperties",
//																	 "propertiesContainer",
//																	 cssData.properties);
//				autocompleteProperties.dispatchEvent(new Event("autocompleteCreated"));
                
                propertiesAutocomplete = new Autocomplete2("textInputProperties", cssData.properties, true);
                valuesAutocomplete = new Autocomplete2("textInputValues", cssData.tranformFunctions, false);
                
                // TODO target
                targetStyle.setProperty(propertyDiv.innerHTML.trim(), valueDiv.innerHTML.trim());
                target.addEventListener("transitionend", targetTransitionEnd);
//                console.log(propertiesAutocomplete.getOptions());
//                console.log(valuesAutocomplete.getOptions());
                
            }()),
            
            amIDigitArrowKey = function (keyCode) {
                if (keyCode > 36 && keyCode < 41) {
                    return true;
                }
                return false;
            };
        
        
        
        // *********************************************
        // TODO CSS PROPERTIES
        // *********************************************
        // prima era keyup
        textInputProperties.oninput = function (event) {
//            console.log("oninput");
//          if (!amIDigitArrowKey(event.keyCode)) {
            if (this.value === "") {
                propertiesAutocomplete.hideAll();
            } else {
                propertiesAutocomplete.filter(this.value);
//                targetStyle.setProperty(this.value, textInputValues.value);
            }
            activeTextInput = this.id;
//           }
        };
        textInputProperties.onchange = function (event) {
//            console.log("onchange");
//            this.focus = false;
            textInputValues.focus();
//            valuesAutocomplete.setData(cssData.tranformFunctions, false);
        };
//        textInputProperties.onfocus = function (event) {
//            console.log("onfocus");
//        };
 
        
        // *****************************************
        // CSS VALUES
        // *****************************************
        textInputValues.oninput = function (event) {
            if (this.value === "") {
                valuesAutocomplete.hideAll();
            } else {
//                console.log(this.value);
                valuesAutocomplete.filter(this.value);
//                targetStyle.setProperty(this.value, textInputValues.value);
            }
            activeTextInput = this.id;
        };
//        textInputValues.onfocus = function (event) {
//            console.log("onfocus");
//        };
        
//        document.onkeypress = function (event) {
//            
//            console.log(event);
//        };
        
        // *****************************************
        // CSS Property editable DIV
        // *****************************************
        propertyDiv.oninput = function () {
            console.log(this.innerHTML.trim());
            targetStyle.setProperty(this.innerHTML.trim(), valueDiv.innerHTML.trim());
        };
        // *****************************************
        // TODO CSS Value editable DIV
        // *****************************************
        valueDiv.oninput = function () {
//            console.log("change");
            targetStyle.setProperty(propertyDiv.innerHTML.trim(), this.innerHTML.trim());
        };
        // **********************************
        // KEYBOARD EVENTS
        // **********************************
        document.onkeyup = function (event) {
            
//            event.repeat = true;
//            console.log(event.repeat);

            switch (event.keyCode) {
                    
            case 13: // RETURN
//                textInputProperties.value = Autocomplete.getPropertySelected();
//                    Autocomplete.hideAll();
                    
                if (activeTextInput === "textInputProperties") {
                    textInputProperties.value = propertiesAutocomplete.getPropertySelected();
                    propertiesAutocomplete.hideAll();
                } else {
                    textInputValues.value = valuesAutocomplete.getPropertySelected();
                    valuesAutocomplete.hideAll();
                }
                
//                textInputValues.autofocus = true;
                break;

            case 38: // UP
//                Autocomplete.moveTheSelection("UP");
//                Autocomplete.moveCursorToEnd(textInputProperties);
                    
//                console.log(activeTextInput);
                if (activeTextInput === "textInputProperties") {
                    propertiesAutocomplete.moveTheSelection("UP");
                    propertiesAutocomplete.moveCursorToEnd(textInputProperties);
                } else {
//                    console.log("UP");
                    valuesAutocomplete.moveTheSelection("UP");
                    valuesAutocomplete.moveCursorToEnd(textInputValues);
                }


                break;

            case 40: // DOWN
//                Autocomplete.moveTheSelection("DOWN");
                if (activeTextInput === "textInputProperties") {
                    propertiesAutocomplete.moveTheSelection("DOWN");
                } else {
//                    console.log("DOWN");
                    valuesAutocomplete.moveTheSelection("DOWN");
                }
                
                break;

            default:
                break;
            }
        
            targetStyle.setProperty(textInputProperties.value, textInputValues.value);
            
        };
        
        
        
        // define public interface
        last = "last";
        return {
            last : last
        };

    }());

    global.CssApp = CssApp;

}(this));


