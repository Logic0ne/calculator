//Creates the calculator GUI and listens for user inputs
function makePage(){
    //Select the HTML div to put the calculator
    const calc =  document.querySelector('#keypad')

    //Loop that create a row the buttons will be placed
    for(let i=0;i<calculatorButtons.length;i++){
        const buttonRow = document.createElement('div');
        buttonRow.setAttribute('class', "row");
        buttonRow.setAttribute('id', `"btnRow${i}"`);
        calc.append(buttonRow);

        //Loop that places the buttons on the row and lets users interact with them
        for(let j=0;j<calculatorButtons[i].length;j++){
            const btn = document.createElement('div');
            btn.setAttribute('class', "button");
            btn.setAttribute('id', `button${i}-${j}`);
            btn.textContent = calculatorButtons[i][j];
            btn.addEventListener('click', click);
            btn.addEventListener("transitionend", removeTransition);
            buttonRow.append(btn);
        }
    }
}
//removes the button press animation
function removeTransition(e){

    if(e.propertyName=='transform'){
        e.target.classList.remove('playing');
    }
    
}
//keyboard function passes value to click
function keydown(e){
    click(e);
}

//The logic for what to do with each user input to the calculator
function click(e){
    document.querySelector('#audio').currentTime=0.06;
    document.querySelector('#audio').play();
    if (screenValue.length>10){
        setTimeout(() => {
            document.querySelector('#screen').textContent = "ERROR";
        }, 1);
        AC();
    }
    // document.querySelector('.button').
    //saves the value of what was clicked depending if from mouseclick or keyboard
    if(typeof e.key=='string'){//from keyboard
        var value = e.key;
        //horrible hack to get window event listener connected to key
        for (let i=0;i<calculatorButtons.length;i++){
            for (let j=0;j<calculatorButtons[i].length;j++){
                if(calculatorButtons[i][j]==e.key){
                    document.querySelector(`#button${i}-${j}`).classList.add('playing');
                }
            }
        }

    }
    else{//from clicking
        var value = e.target.textContent;
        document.querySelector(`#${e.target.id}`).classList.add('playing');
        
    }
    

    //IF the input is a digit updates the screen
    if(Number.isInteger(parseFloat(value))){
        screenValue+=value;
        document.querySelector('#screen').textContent = screenValue;
    }
    else if((value=='.')&&(!screenValue.includes(['.']))){
        console.log(typeof screenValue, screenValue);
        console.log(!screenValue.includes(['.']));
        screenValue+=value;
        document.querySelector('#screen').textContent = screenValue;
    }
    //IF the input is an operator (not including -)
    else if(['×','+','÷'].includes(value)){
        if(screenValue=='-'){
            screenValue="";
        }

        //If the user has previously entered a value then that value is stored to the compute array
        if(screenValue!=''){
            computeValues.push(screenValue);

            //This runs when the user has entered 2 values to compute with an operator, but instead of 
            //pressing '=', they continue to press values and operators, compunding the sum.
            if (computeValues.length==2){
                previousAnswer = operate();
                computeValues = [previousAnswer];
                screenValue = "";
                document.querySelector('#answer').textContent = previousAnswer;
            }
        }

        //Stores the operation pressed
        operationStore=value;

        // resets the screen value after pressing an operand, so that the next time a value is pressed,
        // the old value doesnt preceed it
        screenValue="";
        document.querySelector('#screen').textContent = operationStore;
    }

    //IF the input is '-'. This is a special case to allow negative numbers be inputted.
    else if(value=='-'){
        
        //Runs if the display is empty, in order to preceed a digit
        if(screenValue==''){
            screenValue+=value;
            document.querySelector('#screen').textContent = value;
        }
        //runs when - is pressed after a number input, acting like the other operators
        else if((screenValue!='')&&!(['×','+','÷','-']).includes(screenValue)){
            computeValues.push(screenValue);
            console.log("this neg is happening");

            //This runs when the user has entered 2 values to compute with an operator, but instead of 
            //pressing '=', they continue to press values and operators, compunding the sum.
            //It is identical to the regular operator, allowing negative compounding
            if (computeValues.length==2){
                previousAnswer = operate();
                computeValues = [previousAnswer];
                screenValue = "";
                document.querySelector('#answer').textContent = previousAnswer;
            }
            operationStore=value;
            screenValue="";
            document.querySelector('#screen').textContent = operationStore;
        }
        // operationStore=value;
    }
    //Resets all calculator variables and clears screens
    else if(value=="AC"){
        AC();
    }

    //Removes the last character of the value or the operator on screen
    else if(value=="DEL"){
        screenValue=screenValue.slice(0,length-1);
        operationStore='';
        document.querySelector('#screen').textContent = screenValue;
    }
    //Displays the previously computed value on screen
    else if(value=="ANS"){
        document.querySelector('#screen').textContent = previousAnswer;
    }

    //IF the input is '='
    else if(value=="="){


        //Moves the value on screen to the compute array, if it isnt empty
        if (screenValue!=''){
            computeValues.push(screenValue);
        }

        //Calls the compute function operate(), and updates values. 
        //Does not allow a '-' on screen to be operated. The other operators are dealt with differently
        //due to the need for - to prepend numbers.
        if(!(screenValue=='-')){
            previousAnswer = operate();
        }
        computeValues = [];
        screenValue = "";
        operationStore="";
        document.querySelector('#screen').textContent = "";
        document.querySelector('#answer').textContent = previousAnswer;
        
        //Dealing with division by 0
        if (previousAnswer==Infinity){
            AC();
            document.querySelector('#screen').textContent = "Higher spatial dimensions unavailable";
        }


        
    }

}

//This is where the computation happens, the compute array is used to determine what to return
function operate(){
    //to make it easier to read
    let a = undefined;
    let b = undefined;

    //IF the compute array has 2 user inputted values, and an operator. eg.input[5+5] ... result[10]
    //Is able to deal with negative numbers eg. input[-2--10=] ... reuslt[8]
    //NORMAL OPERATION
    if (computeValues.length==2){
        a = parseFloat(computeValues[0]);
        b = parseFloat(computeValues[1]);
        previousOperand = b;
        previousOperation = operationStore;
    }

    //When a user has computed a sum and then operates again in succession eg. input[2+8=+10=] ... result[10,20]
    //only runs when there is a value stores in previousAnswer and the compute array doesnt have 2 values
    //SUCCESSIVE OPERATION
    else if((computeValues.length==1)&&(previousAnswer!=undefined)){
        a = parseFloat(previousAnswer);
        b = parseFloat(computeValues[0]);
        previousOperand = b;
        previousOperation = operationStore;
    }

    //This runs only when the user has entered a value to screen and pressed =. eg 15= ... result[15]
    //displays the user input back to them
    //NO OPERATION
    else if((computeValues.length==1)&&(previousAnswer==undefined)){
        return parseFloat(computeValues[0]);
    }

    //This runs when a user has computed a value and then presses =. It will take the second value of the previously computed 
    //array and rerun it against the previously computed answer. eg input[10+5=====] ... result[15,20,25,30,35]
    //COMPOUNDING OPERATION
    else if((computeValues.length!=2)&&(previousAnswer!=undefined)&&(screenValue=='')){
        a = parseFloat(previousAnswer);
        b = parseFloat(previousOperand);
    }

    //This stops users from inputting operands with no numbers and pressing =. Without it
    //the function would return NAN for input[+=]
    //NAN OPERATION
    else if((previousAnswer==undefined)){
        previousOperand=undefined;
        return undefined;
    }

    //Runs if the function made it this far without a operator. Runs in case of 
    //compounding calculations where the user hasnt entered a new value.
    if(operationStore==''){
        operationStore=previousOperation;
    }

    //Computing the result. The hard work of knowing what needs to be in a and b is done already
    if (operationStore=='+'){
        return parseFloat((a+b).toPrecision(precisionValue));;
    }
    if (operationStore=='×'){
        return parseFloat((a*b).toPrecision(precisionValue));

    }
    if (operationStore=='-'){
        return parseFloat((a-b).toPrecision(precisionValue));;
    }
    if (operationStore=='÷'){
        return parseFloat((a/b).toPrecision(precisionValue));;
    }
}
//Resets all variables and screens
 function AC(){
    screenValue="";
    previousAnswer = undefined;
    previousOperand = undefined;
    computeValues = [];
    operationStore = "";
    previousOperation = "";
    document.querySelector('#screen').textContent = screenValue;
    document.querySelector('#answer').textContent = screenValue;
 }



// initialized global values
const precisionValue = 8;
var previousAnswer = undefined;
var computeValues = [];
var screenValue = "";
var operationStore = "";
var previousOperand = undefined;
var previousOperation = "";
const calculatorButtons = 
[["7","8","9","DEL","AC"],
["4","5","6","×","÷"],
["1","2","3","+","-"],
["0",".","","ANS","="]];
window.addEventListener('keydown', keydown);


makePage();





