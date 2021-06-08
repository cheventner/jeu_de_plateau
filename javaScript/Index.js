//! on manipule le nom du joueur grâce à l'input "name" correspondant
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

//! quand on clique sur le bouton jouer, les règles du jeu se masquent
let btnPlay = document.querySelector(".start_game");

btnPlay.addEventListener("click", () => {
  let ruleContain = document.querySelector(".rule-contain");
  let gameContain = document.querySelector(".game-contain");

  ruleContain.style.display = "none";
  gameContain.style.display = "grid";
  battle.start();
});

//! on génère la fenêtre d'affichage du gagnant
function showWinner(html) {
  swal
    .fire({
      title: "Winner is :",
      imageUrl: "./img/winner.png",
      background: "linear-gradient(#e45f1d, 70%, #e9a13d)",
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },

      html,
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonColor: "#9E4660",
      focusConfirm: false,
      confirmButtonText: "Rejouer",
      confirmButtonColor: "#9E4660",
      confirmButtonAriaLabel: "Rejouer",
      cancelButtonText: "Quitter",
      cancelButtonAriaLabel: "Quitter",
    })
    //si on clique sur rejouer, on relance la création de la map, on remet les pv à 100 pour chaque player,
    // on remet les armes des players par défaut, on remet les informations des players dans le HTML
    .then((response) => {
      if (response.isConfirmed) {
        battle.reload();
        players[0].revive();
        players[1].revive();
        assignDefaultWeapons();
        battle.updatePlayersInformation();
      }
    });
}

//! fenêtre d'information lorsque la battle commence
function showFightBegins(html) {
  swal.fire({
    title: "Avertissement de début du combat",
    titleText: "Le combat commence ",
    imageUrl: "./img/battle.png",
    imageWidth: 300,
    background: "linear-gradient(#e45f1d, 70%,  #e9a13d)",
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
    timer: 1000,

    html,
    showCloseButton: false,
    showCancelButton: false,
    focusConfirm: false,
    showConfirmButton: false,
  });
}

// fenêtre d'information pour déplacement impossible
function showImpossibletoMove(html) {
  swal.fire({
    title: "impossible de se déplacer",
    titleText:
      "Impossible de vous déplacer, selectionner une case colorée autour de votre joueur",

    background: "linear-gradient(#e45f1d, 70%,  #e9a13d)",
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
    html,
    showCloseButton: false,
    showCancelButton: false,
    focusConfirm: false,
    showConfirmButton: true,
    confirmButtonColor: "#9E4660",
  });
}

const players = [
  //! img du player, coloration des cases possibles autour du joueur (3), true pour initialiser le player 1
  new Player("./img/avatar/sorcier_avatar.png", 3, true),
  new Player("./img/avatar/goblin_attack.png", 3),
];

//! On récupére uniquement les armes ayant 10 d'atk
const baseWeapons = WEAPONS.filter((w) => w.dmg === 10);

function assignDefaultWeapons() {
  players.forEach((player, index) => {
    //! On ajoute l'arme par défaut en effectuant un clonage de l'objet pour éviter les effets de bords en cas de modifications de WEAPONS
    player.changeWeapon(Object.assign({}, baseWeapons[index]));
  });
}

//! on assigne aux joueurs leurs armes par défaut
assignDefaultWeapons();

const battle = new Battle(players, showWinner);
