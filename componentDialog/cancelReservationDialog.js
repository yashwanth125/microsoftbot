const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const {ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt, ActivityPrompt } = require('botbuilder-dialogs');

const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

const {CardFactory} = require('botbuilder');
var ACData = require("adaptivecards-templating");

const RestaurantCard = require('../resources/adaptiveCards/sample.json')

const CARDS = [
    RestaurantCard
];

var template = new ACData.Template(CARDS[0]);
var cardPayload = template.expand({
    $root: CARDS[0]
 });
const CHOICE_PROMPT    = 'CHOICE_PROMPT';
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const NUMBER_PROMPT    = 'NUMBER_PROMPT';
const DATETIME_PROMPT  = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const CARD_PROMPT = 'CARD_PROMPT';
var endDialog ='';

class CancelReservationDialog extends ComponentDialog {
    
    constructor(conservsationState,userState) {
        super('cancelReservationDialog');



this.addDialog(new TextPrompt(TEXT_PROMPT));
this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
this.addDialog(new ActivityPrompt(CARD_PROMPT,  this.inputValidator));
this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
this.addDialog(new NumberPrompt(NUMBER_PROMPT,this.noOfParticipantsValidator));
this.addDialog(new DateTimePrompt(DATETIME_PROMPT));


this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
    this.firstStep.bind(this),  // Ask confirmation if user wants to make reservation?
    this.confirmStep.bind(this), // Show summary of values entered by user and ask confirmation to make reservation
    this.summaryStep.bind(this)
           
]));




this.initialDialogId = WATERFALL_DIALOG;


   }

   async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
        await dialogContext.beginDialog(this.id);
    }
}

async firstStep(step) {
endDialog = false;
await step.context.sendActivity({
    text: 'Enter reservation details for cancellation:',
    attachments: [CardFactory.adaptiveCard(CARDS[0])]
});


return await step.prompt(CARD_PROMPT);

}


async confirmStep(step){
   // step.values.reservationNo = step.result
   var msg = ` Did you mean : ${step.result.value.myColor}`;
   return await step.prompt(CONFIRM_PROMPT, msg, ['yes', 'no']);
  // return await step.prompt(TEXT_PROMPT, 'In what name reservation is to be made?: ${step.result.value.myColor}');
    /*
   var msg = ` You have entered following values: \n Reservation Number: ${step.result.value.myColor}`;
    await step.context.sendActivity(msg);
    return await step.prompt(CONFIRM_PROMPT, 'Are you sure that all values are correct and you want to CANCEL the reservation?', ['yes', 'no']);
   */
}

async summaryStep(step){

    if(step.result===true)
    {
      // Business 

      await step.context.sendActivity("Reservation successfully cancelled. Your reservation id is : 12345678")
      endDialog = true;
      return await step.endDialog();   
    
    }


   
}

async isDialogComplete(){
    return endDialog;
}

// If you remove this validation logic, it will cause an error cause this is mandatory for ActivityPrompt
async inputValidator(promptContext){
    const userInputObject = promptContext.recognized.value.value;

    // You can add some validation logic for email address and phone number
    // userInputObject.myEmail, userInputObject.myTel

    return true;
}

}





module.exports.CancelReservationDialog = CancelReservationDialog;








