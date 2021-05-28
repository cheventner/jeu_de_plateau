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

  ruleContain.style.display = "none";
  gameContain.style.display = "grid";
});

//! afficher et cacher bouton "Attack" et "Defense"

let btnAttackP1 = document.querySelector(".attack_p1");
let btnAttackP2 = document.querySelector(".attack_p2");
let btnDefenseP1 = document.querySelector(".defense_p1");
let btnDefenseP2 = document.querySelector(".defense_p2");

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
  } else if (current === 1) {
    players[0].turnToPlay = true;
    players[1].turnToPlay = false;
  }
}
// initialise le joueur suivant et réinitialise le nombre de pas possible pour le joueur qui vient de finir son tour
function nextPlayerToMove(current) {
  nextPlayerToPlay(current);
  if (current === 0) {
    players[0].stepsCount = players[0].abilityToMove;
  } else if (current === 1) {
    players[1].stepsCount = players[1].abilityToMove;
  }
}

// affiche les boutons d'actions au joueur courant
function displayBtnAttkDef(current) {
  if (current === 0) {
    // On affiche les boutons pour le joueur 1
    btnAttackP1.style.display = "block";
    btnDefenseP1.style.display = "block";
    // On cache les boutons pour le joueur 2
    btnAttackP2.style.display = "none";
    btnDefenseP2.style.display = "none";
  } else if (current === 1) {
    // On affiche les boutons pour le joueur 2
    btnAttackP2.style.display = "block";
    btnDefenseP2.style.display = "block";
    // On cache les boutons pour le joueur 1
    btnAttackP1.style.display = "none";
    btnDefenseP1.style.display = "none";
  }
}

// affiche les informations de l'arme portée par le joueur courant
function updateWeaponInformation(current) {
  const weapon = players[current].currentWeapon;
  let dmgDiv, nameDiv, imgDiv;

  if (current === 0) {
    dmgDiv = ".damage_p1";
    nameDiv = ".weapon-name_p1";
    imgDiv = ".weapon-img_p1";
  } else if (current === 1) {
    dmgDiv = ".damage_p2";
    nameDiv = ".weapon-name_p2";
    imgDiv = ".weapon-img_p2";
  }
  document.querySelector(dmgDiv).innerHTML = "Dégâts: " + weapon.dmg;
  document.querySelector(nameDiv).innerHTML = weapon.name;
  document.querySelector(imgDiv).src = weapon.imgSrc;
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
    // On met à jour les informations de l'arme du joueur courant
    updateWeaponInformation(current);
  }

  //! c'est au joueur suivant de joueur
  nextPlayerToMove(current);
  current = getCurrentPlayer();

  //! Si il s'est arrêté sur une cellule adjacente à un autre player on passe en mode combat
  const enemy = map.getEnemyNextToPlayer(current);
  if (enemy) {
    //! on supprime les cellules marquées comme possibles pour le joueur courant
    map.removePossibleCells();
    //! on supprime les weapons de la map
    map.deleteWeapons();
    //! on affiche les boutons  attaque et défense pour le joueur courant
    displayBtnAttkDef(current);
    //! on arrête d'écouter les évenements de déplacement
    document
      .querySelector("#gameboard")
      .removeEventListener("click", movePhase);
  } else {
    //! Sinon on présente les positions possibles pour le joueur suivant
    map.showAvailablePositionsForPlayer(current);
  }
}
map.showAvailablePositionsForPlayer(getCurrentPlayer());
document.querySelector("#gameboard").addEventListener("click", movePhase);

//todo Il faut écouter un / des évènements pour savoir si le joueur courant attaque ou défend

//! Si le player a cliqué sur défendre il se met en mode défense
document.querySelectorAll(".defense_p1, .defense_p2").forEach((defenseDiv) => {
  defenseDiv.addEventListener("click", function (e) {
    let current = getCurrentPlayer();
    // const currentWeapon = players[current].currentWeapon.dmg;
    // const pv = players[current].pv;
    // const mode = players[current].mode;

    //! on désactive le bouton attaque
    document.querySelectorAll(".attack_p1, .attack_p2").forEach((attackDiv) => {
      attackDiv.disabled = true;
      attackDiv.style.background = "grey";
    });

    players[current].getHit;
    players[current].totalDefense;
    // Si l'adversaire est en mode defense on lui inflige
    players[currentPlayer].totalDmg - players[0].totalDefense;
    document.querySelector(".life_point_p1").innerHTML = current.getHit;

    //todo Le joueur courant change (= currentPlayer = 1 || 0, afficher/cacher les boutons pour les joueurs)
  });
  //! c'est au joueur suivant de joueur
  nextPlayerToPlay();
  getCurrentPlayer();
});

//todo créer méthode nextPlayerToAttack qui appelle nextPlayerToPlay, re récupère le current player et
//todo appelle ensuite displayBtnAttDef
//! on initialise le joueur suivant ( player1 ou player2)
function nextPlayerToAttack(currentPlayer) {
  currentPlayer = getCurrentPlayer();
  nextPlayerToPlay(currentPlayer);
  displayBtnAttkDef(currentPlayer);
}

// Si le player a cliqué sur attaque on attaque l'adversaire
document.querySelectorAll(".attack_p1, .attack_p2").forEach((attackDiv) => {
  attackDiv.addEventListener("click", function (e) {
    //! on récupère le joueur courant
    let currentPlayer = getCurrentPlayer();
    //! on récupère les dommages du joueur courant
    let dmg = players[currentPlayer].totalDmg;
    //! on récupère l'autre joueur
    let enemy = map.getEnemyNextToPlayer(currentPlayer);

    //! le joueur attaque, il n'est donc pas en mode défense
    players[currentPlayer].defense = false;

    //! Si l'adversaire est en mode defense on lui inflige
    enemy.getHit(dmg);

    //! on met à jour les points de vie dans les balises HTML
    if (currentPlayer === 0) {
      document.querySelector(".life_point_p2").innerHTML =
        "Points de vie : " + enemy.pv;
    } else if (currentPlayer === 1) {
      document.querySelector(".life_point_p1").innerHTML =
        "Points de vie : " + enemy.pv;
    }

    // document.querySelectorAll(".life_point_p1, .life_point_p2").innerHTML =
    //   enemy.pv;
    //todo on vérifie si l'adversaire est mort : on utilise enenmy.pv pour vérifier si c'est > 0
    if (enemy.pv === 0) {
      alert("perdu");
    } else if (enemy.pv > 0) {
      nextPlayerToAttack(currentPlayer);
    }

    //todo s'il n'est pas mort c'est a l 'autre de jouer : créer méthode nextPlayerToAttack qui appelle nextPlayerToPlay, re récupère le current player et
    //todo appelle ensuite displayBtnAttDef

    //  et on supprime le mode defense de l'adversaire
    // nextPlayerToFight();
    // Sinon on lui inflige

    // players[1].getHit
    // Si l'adversaire est mort on affiche le joueur courant en tant que vainqueur
    // Sinon le joueur courant change
    //  currentPlayer = 1 || 0,
    //  afficher/cacher les boutons pour les joueurs)
  });
});
