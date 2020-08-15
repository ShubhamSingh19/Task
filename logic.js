$(document).ready(function () {
  var array = [];
  var storageKey = "toDoList";
  var update = false;
  var index;
  var ref;

  function changeDisplay(text, show) {
    var display = $(".display");
    if (show) {
      display.html(text);
      display.slideDown(500);
    } else {
      display.slideUp(500);
      display.html(text);
    }
  }

  //display a additional/hidden info for notes.
  $("#list").on("mouseenter", ".data", function () {
    changeDisplay($(this).text(), true);
  });
  $("body").on("click", ".input", function () {
    changeDisplay("", false);
  });

  //saving on storage
  function saveOnStorage(data) {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function fetchingFromStorage() {
    return JSON.parse(localStorage.getItem(storageKey));
  }

  function generateId() {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
  }
  function getIndex(array, selector) {
    var data = Number(selector.text());
    return array.findIndex((d) => d.id === data);
  }

  //check number of task to adjust border and hide show noTask info
  function checkTask(data) {
    if (data.length === 0) {
      $(".noTask").slideDown(500);
      $(".in").css("box-shadow", "none");
    } else if (data.length === 1) {
      $(".noTask").slideUp(500);
      $(".task").css("border-radius", "10px");
    } else if (data.length === 2) {
      $(".noTask").slideUp(500);
      $(".task:first-child").css("border-radius", "10px 10px 0 0");
      $(".task:last-child").css("border-radius", "0 0 10px 10px");
    } else {
      $(".noTask").hide();
      $(".task").css("border-radius", "0");
      $(".task:first-child").css("border-radius", "10px 10px 0 0");
      $(".task:last-child").css("border-radius", "0 0 10px 10px");
    }
  }

  // add 1 task to view. It is view all task's helper function
  function viewTask(array, data) {
    $("#list").prepend(
      "<div class='task'><span><i " + // DONT FORGET TO PLACE SPACE BETWEEN i(in this line) AND class='fa...'(in next 3rd line)
        `${
          data.important
            ? "class='fa fa-star important'"
            : "class='fa fa-star dimmed'"
        }` +
        "></i></span><span id='_id' class='hidden'>" +
        data.id +
        "</span><span " +
        `${data.completed ? " class='data completed'" : " class='data'"}` +
        ">" +
        data.body +
        "</span><span class='btn'><i class='edit fa fa-pencil'></i></span>" +
        "<span class='btn'><i class='delete fa fa-trash'></i></span></div>"
    );
    checkTask(array);
  }

  //view all tasks on browser/view
  function ViewAllTasks(arrayData) {
    $(".in").append("<h3 class='dimmed noTask'>No task to complete</h3>");
    if (arrayData.length === 0) $(".in").css("box-shadow", "none");
    $.each(arrayData, function (i, data) {
      viewTask(arrayData, data);
    });
  }

  function generateDummyData() {
    return [
      {
        id: generateId(),
        body: "My very first note 😎",
        important: false,
        completed: true,
      },
      {
        id: generateId(),
        body: "Keep taking your notes 📝",
        important: false,
        completed: false,
      },
      {
        id: generateId(),
        body: "Attend meeting at 11:00 AM 💼",
        important: true,
        completed: true,
      },
      {
        id: generateId(),
        body: "I have to water my plants 🌻",
        important: true,
        completed: false,
      },
    ];
  }

  //starting function
  function init() {
    if (fetchingFromStorage() === null) {
      array = generateDummyData();
      saveOnStorage(array);
    } else {
      array = fetchingFromStorage();
    }
    ViewAllTasks(array);
  }

  //logic for adding a task
  function addTask() {
    var newBody = $("#newTodoInput").val();
    if (newBody) {
      var newTodo = {
        id: generateId(),
        body: newBody,
        important: false,
        completed: false,
      };
      array.push(newTodo);
      saveOnStorage(array);
      $("#newTodoInput").val(""); //resetting input fields;
      viewTask(array, newTodo);
    }
  }

  init(); // main function

  //add task on clicking + button
  $("#add").click(function () {
    addTask();
  });

  //add task on enter key
  $("#newTodoInput").keyup(function (e) {
    if (e.which == 13 && !update) {
      addTask();
    }
  });

  //marking a task important
  $("#list").on("click", ".fa-star", function () {
    $(this).toggleClass("important dimmed");
    var index = getIndex(array, $(this).parent().parent().children("#_id"));
    array[index].important = !array[index].important;
    saveOnStorage(array);
  });

  //marking a task complete by cutting the text
  $("#list").on("click", ".data", function () {
    $(this).toggleClass("completed");
    var index = getIndex(array, $(this).parent().children("#_id"));
    array[index].completed = !array[index].completed;
    saveOnStorage(array);
  });

  //Updating view and dataBase edit task's helper function
  function updateTask(dataArray) {
    var selector = $("#newTodoInput");
    var data = selector.val();
    $(ref).parent().parent().children(".data").text(data); //view Updates
    dataArray[index].body = data; //array update
    update = false;
    $("#save").hide();
    $("#add").show(500);
    saveOnStorage(dataArray); // storage update
    selector.val("");
  }

  //Edit task
  $("#list").on("click", ".edit", function () {
    changeDisplay("", false);
    $("#add").hide();
    $("#save").show(500);
    index = getIndex(array, $(this).parent().parent().children("#_id"));
    ref = this;
    update = true;
    $("#newTodoInput").focus();
    $("#newTodoInput").val(array[index].body);
    $("#newTodoInput").keyup(function (e) {
      if (e.which == 13 && update) {
        updateTask(array);
      }
    });
    $(".input").on("click", "#save", function () {
      if (update) {
        updateTask(array);
      }
    });
  });

  //Delete task
  $("#list").on("click", ".delete", function () {
    var dataContainer = $(this).parent().parent().children(".data");
    var data = Number(dataContainer.parent().children("#_id").text());
    dataContainer.css("text-decoration", "line-through");
    array = array.filter((d) => d.id !== data);
    $(this)
      .parent()
      .parent()
      .fadeOut(function () {
        $(this).detach();
        checkTask(array);
      });
    saveOnStorage(array);
    $("#save").hide();
    $("#add").show(500);
    $("#newTodoInput").val("");
    changeDisplay("", false);
  });
});
