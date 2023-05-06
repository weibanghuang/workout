let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
let maxPrev = [];
updateWorkout();

document.querySelector('.workout_button')
  .addEventListener('click', () => {
    addWorkout();
  });

document.querySelector('.clear_button')
.addEventListener('click', () => {
  clearWorkout();
  });


function double_format(a){
    if (a.toString().length == 1) {
        a = "0" + a;
    }
    return a;
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function addWorkout(){
    const name = document.querySelector('.name').value;
    const rep = document.querySelector('.rep').value;
    const weight = document.querySelector('.weight').value;
    const today = new Date();

    //yyyymmdd complete
    const year = double_format(today.getFullYear());
    const month = double_format(today.getMonth()+1);
    const day = double_format(today.getDate());

    const date = year+''+month+''+day;

    //hhmmss 24 hr complete
    const hour = double_format(today.getHours());
    const minute = double_format(today.getMinutes());
    const second = double_format(today.getSeconds());

    const time = hour + "" + minute + "" + second;

    workouts.push([date,time,name,rep,weight]);
    updateWorkout();
}

function clearWorkout(){
  document.querySelector('.name').value = '';
  document.querySelector('.rep').value = '';
  document.querySelector('.weight').value = '';
}

function updateWorkout(){
    let workoutHTML = '';
    for (i in workouts) {
      workouts[i][2] = toTitleCase(workouts[i][2].toString());
    } 
    for (let i = workouts.length-1; i >=0; i--) {
      const workoutObject = workouts[i];
      const date = workoutObject[0];
      const year = date.substr(0,4);
      const month = date.substr(4,2);
      const day = date.substr(6,2);
      const today = new Date();
      const year1 = double_format(today.getFullYear());
      const month1 = double_format(today.getMonth()+1);
      const day1 = double_format(today.getDate());
      if (month == month1 && year == year1 && day == day1){
        const time = workoutObject[1];
        let hour = time.substr(0,2);
        let minute = time.substr(2,2);
        let second = time.substr(4,2);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        if (hour >=13){
          hour = hour - 12;
        }else if (hour == 0){
          hour = 12
        }
        const html = `
          <div class="wrap"> 
            <div class="wrap_list">${year+'/'+month+'/'+day}</div>
            <div class="wrap_list">${hour+':'+minute+':'+second+' '+ampm}</div>
            <div class="wrap_list">${workoutObject[2]}</div>
            <div class="wrap_list">${workoutObject[3]} reps</div>
            <div class="wrap_list">${workoutObject[4]} pounds</div>
            <button class="delete_button">X</button>
          </div>
        `;
        workoutHTML += html;
      }
    }

    document.querySelector('.workout_list')
    .innerHTML = workoutHTML;

    localStorage.setItem('workouts',JSON.stringify(workouts));
    
    //static waiting for listen. didnt work before because it was outside of updateWorkout
    document.querySelectorAll('.delete_button')
    .forEach((deleteButton, index) => {
      deleteButton.addEventListener('click', () => {
        workouts.splice(workouts.length-1-index, 1);
        updateWorkout();
      });
    });
}

function export_data(){
  let csvContent = "data:text/csv;charset=utf-8," + workouts.map(e => e.join(",")).join("\n");
  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

// function read_csv_array(){
// //   var input_file = fileInput.files[0];
// //   console.log(input_file);
//     console.log(document.querySelector('.fileInput').files);
// }

function calculate_maxPrev(){
  maxPrev = [];
  let workouts_copy = [...workouts];
  workouts_copy.sort((a, b) => (a[4] - b[4]));
  for (let i = workouts_copy.length - 1; i >= 0; i--) {
    if (!exists(maxPrev,workouts_copy[i][2])){
      maxPrev.push([workouts_copy[i][2],workouts_copy[i][4]]);
    }
  }
  maxPrev.sort((a, b) => (a[0].localeCompare(b[0])));
}

function exists(arr, search) {
  return arr.some(row => row.includes(search));
}

function view_stats(){
  if (document.querySelector('.render_stats').innerHTML==""){
    let maxPrevHTML = "";
    for (i in maxPrev) {
      const maxPrevHTMLpart = `
        <div class = "wrap">
          <div>${maxPrev[i][0]+" Max"}</div>
          <div>${maxPrev[i][1]+" Pounds"}</div>
        </div>
      `;
      maxPrevHTML += maxPrevHTMLpart+"";
    } 
    document.querySelector('.render_stats').innerHTML="<div class=\"wtf2\">"+maxPrevHTML+"</div>";
  }else{
    document.querySelector('.render_stats').innerHTML='';
  }
}

function toggle_data(){
  if (document.querySelector('.hamburger_button').innerHTML== 'X'){
    document.querySelector('.hamburger_button').innerHTML = '&equiv;';
    document.querySelector('.pop_up').innerHTML = "";
  }else{
    //<label for="fileInput" class="input_button">Import Data</label>
    const popup = `
      <div class="button_wrap">

        <input type="file" name="uploadfile" id="fileInput" accept=".csv" class = "input_button"/>
        <button class="export_button">Export Data</button>
        <button class="stats_button">View Max Prev</button>
      </div>
    `;
    document.querySelector('.pop_up').innerHTML = popup;
    document.querySelector('.hamburger_button').innerHTML = 'X';
    
    document.querySelector('input')
      .addEventListener('change', () => {
        // this confuses the fuck out of me... so i readAsText, and use an eventlisten to catch the data while reading?
        // this shit is async???
        var reader = new FileReader();
        reader.addEventListener('load', function() {
            this.result.split("\n").forEach(element=>workouts.push(element.split(",")));
            workouts.sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
            updateWorkout();
          });
        reader.readAsText(document.querySelector('input').files[0]);
        
      });
    document.querySelector('.export_button')
      .addEventListener('click', () => {
        export_data();
      });
    document.querySelector('.stats_button')
    .addEventListener('click', () => {
      calculate_maxPrev();
      view_stats();
      });
  }
}

document.querySelector('.hamburger_button')
  .addEventListener('click', () => {
    toggle_data();
  });









