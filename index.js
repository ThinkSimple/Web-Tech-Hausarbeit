const loadingDiv = document.getElementById("loading-div");
const contentDiv = document.getElementById("content");
const formDiv = document.getElementById("form");
const sidebarDiv = document.getElementById("sidebar");
const friendsDiv = document.getElementById("friends-sidebar");

let activeServer = 0;
let activeChannel = 0;

let socket = null;

let onlineUsers = [];

let chatMessages = []

let data = null;
/*
ZUM TESTEN!

let data = [
  {
    name: "Studium",
    url: "ws://tommydittloff.de:3334",
    icon: "http://tommydittloff.de/wt/studium.png",
    channels: ["Vorlesungen", "Labore", "Mensa", "H-Gebäude-Party"],
  },
  {
    name: "Games",
    url: "ws://tommydittloff.de:3335",
    icon: "http://tommydittloff.de/wt/games.png",
    channels: ["rpg", "fps", "mmo", "tbs", "rts", "wtf"],
  },
  {
    name: "EM 2020",
    url: "ws://tommydittloff.de:3336",
    icon: "http://tommydittloff.de/wt/em2020.png",
    channels: ["Spiele", "Biere"],
  },
];
buildServerSidebar();
buildContentArea();
buildFriendsSidebar();
*/

/**
 * Stellt eine Anfrage an den Server um die Daten für die Web-App zu bekommen.
 */
async function fetchData() {
  loadingDiv.style.visibility = "visible";
  formDiv.style.display = "none";

  try {
    const res = await fetch("http://tommydittloff.de/wt/serverlist/");
    const { serverlist } = await res.json();
    data = serverlist;
    initializeWebSocket(data[0].url);
    buildServerSidebar();
    buildContentArea();
    buildFriendsSidebar();
  } catch (error) {
    contentDiv.textContent = error;
  }
  loadingDiv.style.display = "none";
}

/**
 * Erstellt die Element die der User anklicken kann, um den jeweiligen Server
 * auszuwählen
 */
function buildServerSidebar() {
  
  sidebarDiv.className =
    "h-screen h-screen flex flex-col pt-6 justify-start bg-gray-900";
  while (sidebarDiv.lastElementChild) {
    sidebarDiv.removeChild(sidebarDiv.lastElementChild);
  }
  for (let i = 0; i < data.length; i++) {
    const image = document.createElement(
      "img");
    const paddingDiv = document.createElement("div");
    paddingDiv.className = `w-16 h-16 mx-6 mb-2 ${
      i === activeServer ? "p-1" : ""
    } cursor-pointer rounded-full bg-green-700`;
    image.src = data[i].icon;
    image.className = `w-full h-full rounded-full bg-green-500`;
    image.addEventListener("click", () => {
      console.log("clicked");
      activeServer = i;
      activeChannel = 0;
      buildServerSidebar();
      buildContentArea();
    });
    paddingDiv.appendChild(image);
    sidebarDiv.appendChild(paddingDiv);
  }
}

/**
 * Erstellt die Element die der User anklicken kann, um den jeweiligen Channel
 * auszuwählen
 */
function buildContentArea() {
  while (contentDiv.lastElementChild) {
    contentDiv.removeChild(contentDiv.lastElementChild);
  }
  contentDiv.className = "w-full h-full flex flex-row";

  const chatContent = document.createElement("div");
  chatContent.className = "w-full flex flex-col justify-between";
  const channels = document.createElement("div");
  channels.className = "w-1/5 h-screen bg-gray-800";
  console.log("moin");
  console.log(activeServer);
  const title = document.createElement("h2");
  title.textContent = data[activeServer].name;
  title.className = "p-6  shadow mb-8 text-white font-bold";
  channels.appendChild(title);
  for (let i = 0; i < data[activeServer].channels.length; i++) {
    const div = document.createElement("div");
    div.textContent = "# " + data[activeServer].channels[i];
    div.className =
      "mx-6 mb-2 p-2 text-gray-600 hover:text-white hover:bg-gray-700 cursor-pointer rounded";
    div.addEventListener("click", () => {
      activeChannel = i;
      buildContentArea();
    });
    if (i === activeChannel) {
      div.className =
        "mx-6 mb-2 p-2 bg-gray-700 cursor-pointer text-white rounded";

      const chatTitle = document.createElement("div");
      chatTitle.textContent = data[activeServer].channels[i];
      chatTitle.className = "w-full p-6 shadow mb-8 text-white font-bold";

      const chatMessageTiles = document.createElement("div");
      chatMessageTiles.style.width = "100%";
      chatMessages.forEach((e) => {
        if (e.channel === data[activeServer].channels[i]) {
          const chatMessage = document.createElement("div");
          chatMessage.textContent = `${e.username}: ${e.message}`;
          chatMessage.className =
            "mx-2 my-1 p-2 text-white border-white border-b";
          chatMessageTiles.appendChild(chatMessage);
        }
      });

      const form = document.createElement("div");
      const button = document.createElement("BUTTON");
      button.className = "p-2 bg-white rounded";
      button.textContent = "Senden";
      button.onclick = (e) => {
        sendChatMessage();
      };
      const textField = document.createElement("INPUT");
      textField.setAttribute("type", "text");
      textField.id = "text-field";
      textField.placeholder = `Nachricht an ${data[activeServer].channels[activeChannel]}`;
      textField.className =
        "w-1/2 m-4 py-2 px-4 rounded bg-gray-800 text-white";
      form.appendChild(textField);
      form.appendChild(button);

      chatContent.appendChild(chatTitle);
      chatContent.appendChild(chatMessageTiles);
      chatContent.appendChild(form);
    } else {
    }
    channels.appendChild(div);
  }

  contentDiv.appendChild(channels);
  contentDiv.appendChild(chatContent);
}

/**
 *
 */

function buildFriendsSidebar() {
  while (friendsDiv.lastElementChild) {
    friendsDiv.removeChild(friendsDiv.lastElementChild);
  }

  friendsDiv.className = "w-full bg-gray-800";

  onlineUsers.forEach((e) => {
    console.log("EY");
    console.log(e);
    const friendTile = document.createElement("div");
    friendTile.className =
      "flex flex-row m-2 p-2 text-white bg-gray-900 rounded";
    const image = document.createElement("img");
    image.src = e.avatar;
    image.className = "h-10 w-10 mr-2 object-cover rounded-full";
    const name = document.createElement("div");
    name.textContent = `${e.username}\n ${e.listening}\n${e.ingame}\n${e.info}`;

    friendTile.appendChild(image);
    friendTile.appendChild(name);
    friendsDiv.appendChild(friendTile);
  });
}
/**
 *
 * @param {*} url
 */
function initializeWebSocket(url) {
  socket = new WebSocket(url);

  const connectObj = {
    type: "connect",
    uuid: "",
    username: document.getElementById("username").value,
    listening: document.getElementById("listens-to").value,
    ingame: document.getElementById("in-game").value,
    info: document.getElementById("info").value,
    avatar: document.getElementById("image-path").value,
  };

  socket.onopen = () => {
    console.log("heys");
    console.log(connectObj);
    socket.send(JSON.stringify(connectObj));
  };

  socket.onmessage = (event) => {
    console.log("onmessage");
    let eventDecoded = JSON.parse(event.data);
    console.log(eventDecoded.type);
    console.log(eventDecoded);

    if (eventDecoded.type === "connect") {
      console.log(onlineUsers);
      addUserToFriendList(eventDecoded);
    } else if (eventDecoded.type === "disconnect") {
    } else if (eventDecoded.type === "chat") {
      chatMessages.push(eventDecoded);
      buildContentArea();
    }
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      alert(
        `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
      );
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      alert("[close] Connection died");
    }
  };
}

function addUserToFriendList(user) {
  let containsUser = false;
  onlineUsers.forEach((e) => {
    if (e.username === user.username) {
      containsUser = true;
    }
  });

  if (!containsUser) {
    onlineUsers.push(user);
    buildFriendsSidebar();
  }
}

function removeUserFromFriendList(user) {
  onlineUsers = onlineUsers.filter((e) => {
    return e.username === user.username;
  });
  buildFriendsSidebar();
}

function sendChatMessage() {
  const message = document.getElementById("text-field").value;
  console.log(message);

  if (message === "") return;

  let messageObj = {
    type: "chat",
    username: document.getElementById("username").value,
    message: message,
    channel: data[activeServer].channels[activeChannel],
  };
  chatMessages.push(messageObj);
  buildContentArea();
  socket.send(JSON.stringify(messageObj));
}
