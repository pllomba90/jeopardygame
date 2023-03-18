// Jeopardy functionality plan. 
//First I want a function to create the board. It should probably be a table to allow for
// table headers as categories and consistent dollar amounts. It should be a 6x6 grid 
// of 36 cards.
//Second I will want a function to query the jeopardy API at "http://jservice.io/api/categories". I will need it to 
//populate the categories and five clues for each category. I will use this function to also place clues and categories on the board.
//Third I will want a function to start the game. This will be a simple event listener that will call the 
// previous functions.
// Fourth I will want a function to handle the clicks on the individual cards. I will need to have a single click
//to display the clue and either a second click required to show the answer or set a timeout to display the answer.
//Fifth I will want a function to end the game. This will need to recognize when all clues have been selected
//and alert the player to the end of the game. 
// Sixth and bonus only if I have the time I would like to have a start game page that transistions
//into the game. Something like the tv screen image. 
// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ].
const numCats = 6;
const numClues = 5
const catIds = [];
let categories = [];
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds(numCats) { 
    for(let i=0; i <= numCats; i++) {
        let randomCats = Math.floor(Math.random()* 28162);
       catIds.push(randomCats);    
    }
  return catIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    
       const response = await axios.get("http://jservice.io/api/category",{
            params:{
                id:catId
            }
        });
       let allClues = response.data.clues;
       let randClues= _.sampleSize(allClues, numClues);
       let clues = randClues.map(c => ({
        question: c.question,
        answer: c.answer,
        showing: null,
       }));

       return {title: response.data.title, clues};
       }
       
      
    
    
//First thought on build table but it was difficult to add in the clues and categories

// function buildTable(){
//     $("#categories").append(`<tr id="catRow"></tr>`);
//     $("#catRow").addClass("row flex");
//     for (let i=1; i<=6; i++){
//     $("#catRow").append( `<th class="col-2 text-center" id = "categoryRow">category</th>` );
//     }
//     for (let j=1; j<=5; j++){
//         $("#clues").append(`<tr class="row" id="clueRow${j}"></tr>`);
//         for(let k=1; k<=6; k++){
//             $(`#clueRow${j}`).append( `<td class="col-2 text-center" id="clue">?</td>` );
//         }
//     }
// }
// I found it easier to fill and build simultaneously.
async function fillTable() {
   //category row
    $("#jeopardy thead").empty();
    let $tr = $("<tr>");
    for (let i= 0; i < numCats; i++) {
      $tr.append($("<th>").text(categories[i].title));
    }
    $("#jeopardy thead").append($tr);
  
    //clue/answer section
    $("#jeopardy tbody").empty();
    for (let clueIdx = 0; clueIdx < numClues; clueIdx++) {
      let $tr = $("<tr>");
      for (let catIdx = 0; catIdx < numCats; catIdx++) {
        $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?"));
      }
      $("#jeopardy tbody").append($tr);
    }
  }

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  let id = evt.target.id;
  let [catId, clueId] = id.split("-");
  let clue = categories[catId].clues[clueId];

  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    return
  }
  $(`#${catId}-${clueId}`).html(msg);

}




/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let catIds = await getCategoryIds(numCats);

  categories = [];

  for (let catId of catIds) {
    categories.push(await getCategory(catId));
  }

  fillTable();
}
$("#start").on("click", function(){
  $("#startingScreen").hide(3000, ()=>{
      $("#startingScreen").addClass("d-none");
  });
  setupAndStart()
  $("#jeopardy").on("click", "td", handleClick);
});

$("#restart").on("click", setupAndStart);
