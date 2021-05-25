//todo  - Chercher l'activation et desactivation des boutons
//todo  - Quand J1 joue les boutons de J2 sont desactivés et
//todo  - quand J1 a fini de jouer LES boutons de J2 sont activés
//todo  - et ceux de J1 desactivés

const players = [
  new Player("./img/avatar/sorcier_avatar.png", 3, true),
  new Player("./img/avatar/goblin_attack.png", 3),
];
// On récupére uniquement les armes ayant 10 d'atk
// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
const baseWeapons = WEAPONS.filter((w) => w.dmg === 10);
// On ajoute l'arme par défaut en effectuant un clonage de l'objet pour éviter les effets de bords en cas de modifications de WEAPONS
players.forEach((player, index) => {
  player.addWeapon(Object.assign({}, baseWeapons[index]));
});

//! on inscrit le nom du joueur dans la balise input
let inputP1 = document.querySelector(".input-name_p1");
let namep1 = document.querySelector(".name_player1");
let inputP2 = document.querySelector(".input-name_p2");
let namep2 = document.querySelector(".name_player2");

inputP1.addEventListener("input", function (e) {
  const playerName = e.target.value;
  namep1.innerHTML = playerName;
  players[0].name = playerName;
});

inputP2.addEventListener("input", function (e) {
  const playerName = e.target.value;
  namep2.innerHTML = playerName;
  players[1].name = playerName;
});

//! quand on clique surt le bouton jouer, les règles du jeu se masquent
let btnPlay = document.querySelector(".start_game");

btnPlay.addEventListener("click", () => {
  let ruleContain = document.querySelector(".rule-contain");
  let gameContain = document.querySelector(".game-contain");
  if (getComputedStyle(ruleContain).display != "none") {
    ruleContain.style.display = "none";
  }
  if (getComputedStyle(gameContain).display === "none") {
    gameContain.style.display = "grid";
  }
});

//! afficher et cacher bouton "Attack" et "Defense"

let btnAttackP1 = document.querySelector(".attack_p1");
let btnAttackP2 = document.querySelector(".attack_p2");
let btnDefenseP1 = document.querySelector(".defense_p1");
let btnDefenseP2 = document.querySelector(".defense_p2");

//* afficher bouton attack (joueur1)
function displayBtnAttkDef(current) {
  if (current === 0) {
    if (getComputedStyle(btnAttackP1).display != "none") {
      btnAttackP1.style.display = "none";
    } else {
      btnAttackP1.style.display = "block";
    }
    if (getComputedStyle(btnDefenseP1).display != "none") {
      btnDefenseP1.style.display = "none";
    } else {
      btnDefenseP1.style.display = "block";
    }
  } else if (current === 1) {
    if (getComputedStyle(btnAttackP2).display != "none") {
      btnAttackP2.style.display = "none";
    } else {
      btnAttackP2.style.display = "block";
    }
    if (getComputedStyle(btnDefenseP2).display != "none") {
      btnDefenseP2.style.display = "none";
    } else {
      btnDefenseP2.style.display = "block";
    }
  }
}

//! On créée la map qui ajoute la grille, les obstacles, les joueurs, les armes
const map = new GameMap("#gameboard", 10, players);
map.createMap();

//! on obtient l'index du joueur commencant la partie (player1 qui est à "true")
function getCurrentPlayer() {
  return players.findIndex((p) => p.turnToPlay === true);
}
//! on initialise le joueur suivant ( player1 ou player2)
function nextPlayerToPlay(current) {
  if (current === 0) {
    players[1].turnToPlay = true;
    players[0].turnToPlay = false;
    players[0].stepsCount = players[0].abilityToMove;
  } else if (current === 1) {
    players[0].turnToPlay = true;
    players[1].turnToPlay = false;
    players[1].stepsCount = players[1].abilityToMove;
  }
}

//! on gère le deplacement des joueurs

function movePhase(event) {
  //! on passe les conditions pour autoriser les déplacements sur les cases "possible" ou "weapon"
  const isWeapon = event.target.classList.contains("weapon");
  const isAChoice =
    event.target.classList.contains("possible-1") ||
    event.target.classList.contains("possible-2") ||
    event.target.classList.contains("possible-3");
  if (!isAChoice && !isWeapon) {
    console.log("Not possible cell : ", event.target);
    return;
  }
  //! on récupère le joueur courant
  let current = getCurrentPlayer();

  //! on récupère le N° de case ou se trouve mon joueur courant pour le faire se déplacer
  let cellWhereToMove = event.target;
  if (isWeapon) {
    cellWhereToMove = event.target.parentNode;
  }
  const playerMoved = map.movePlayer(current, cellWhereToMove);
  if (!playerMoved) {
    return;
  }

  //! Le joueur courant a fait un pas ou plus
  players[current].stepsCount -= playerMoved;

  //! Si il a rencontré une arme dans son passage on lui remplace
  if (isWeapon) {
    const weapon = map.replaceWeaponDiv(
      event.target,
      players[current].currentWeapon
    );
    players[current].changeWeapon(weapon);
  }

  //! c'est au joueur suivant de joueur
  nextPlayerToPlay(current);
  current = getCurrentPlayer();
  map.createInformationPlayer(current);

  //! Si il s'est arrêté sur une cellule adjacente à un autre player on passe en mode combat
  const enemy = map.getEnemyNextToPlayer(current);
  if (enemy) {
    //! on affiche les boutons  attaque et défense pour le joueur courant
    displayBtnAttkDef(current);
    //! on arrête d'écouter les évenements de déplacement
    document
      .querySelector("#gameboard")
      .removeEventListener("click", movePhase);
    //! on supprime les weapons de la map
    map.deleteWeaponDiv();
    const isWeapon = event.target.classList.remove("weapon");
  }

  //! Sinon on présente les positions possibles pour le joueur suivant
  map.showAvailablePositionsForPlayer(current);
}
map.showAvailablePositionsForPlayer(getCurrentPlayer());
document.querySelector("#gameboard").addEventListener("click", movePhase);

//todo Il faut écouter un / des évènements pour savoir si le joueur courant attaque ou défend

//! Si le player a cliqué sur défendre il se met en mode défense
document.querySelectorAll(".defense_p1, .defense_p2").forEach((defenseDiv) => {
  defenseDiv.addEventListener("click", function (event) {
    const current = getCurrentPlayer();
    const currentWeapon = players[current].currentWeapon.dmg;
    const pv = players[current].pv;

    //! on desactive le bouton attaque si le player courant à cliqué sur défense
    document.querySelectorAll(".attack_p1, .attack_p2").forEach((attackDiv) => {
      attackDiv.disabled = true;
      attackDiv.style.background = "grey";
    });
    console.log(current);
    console.log(currentWeapon);
    players[current].mode = "defense";

    players[current].getHit;
    players[current].totalDefense;
    document.querySelector(".life_point_p1").innerHTML = current.getHit;

    //todo Le joueur courant change (= currentPlayer = 1 || 0, afficher/cacher les boutons pour les joueurs)
  });
});

// Si le player a cliqué sur attaque on attaque l'adversaire
document.querySelectorAll(".attack_p1, .attack_p2").forEach((attackDiv) => {
  attackDiv.addEventListener("click", function (event) {
    const current = getCurrentPlayer();
    //! on desactive le bouton défense si le player courant à cliqué sur attaque
    document
      .querySelectorAll(".defense_p1, .defense_p2")
      .forEach((defenseDiv) => {
        defenseDiv.disabled = true;
        defenseDiv.style.background = "grey";
      });
    // Si l'adversaire est en mode defense on lui inflige
    current.totalDmg - players[1].totalDefense;
    //  et on supprime le mode defense de l'adversaire
    current.mode = "defense";
    // Sinon on lui inflige
    current.totalDmg;
    // players[1].getHit
    // Si l'adversaire est mort on affiche le joueur courant en tant que vainqueur
    // Sinon le joueur courant change
    //  currentPlayer = 1 || 0,
    //  afficher/cacher les boutons pour les joueurs)
  });
});
