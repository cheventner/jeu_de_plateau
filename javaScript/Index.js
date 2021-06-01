//! on manipule le nom du joueur grâce a l'input "name" correspondant
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

function showWinner(html) {
  swal
    .fire({
      title: "Winner is :",
      imageUrl: "./img/winner.png",
      imageWidth: 400,
      background: "linear-gradient(#50245d, #ab4d60, 70%, #e45f1d, #e9a13d)",
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
      type: "success",
      html,
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonColor: "#50245d",
      focusConfirm: false,
      confirmButtonText: "Rejouer",
      confirmButtonColor: "#50245d",
      confirmButtonAriaLabel: "Rejouer",
      cancelButtonText: "Quitter",
      cancelButtonAriaLabel: "Quitter",
    })
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

const players = [
  new Player("./img/avatar/sorcier_avatar.png", 3, true),
  new Player("./img/avatar/goblin_attack.png", 3),
];
// On récupére uniquement les armes ayant 10 d'atk
// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
const baseWeapons = WEAPONS.filter((w) => w.dmg === 10);

function assignDefaultWeapons() {
  players.forEach((player, index) => {
    //! On ajoute l'arme par défaut en effectuant un clonage de l'objet pour éviter les effets de bords en cas de modifications de WEAPONS
    player.changeWeapon(Object.assign({}, baseWeapons[index]));
  });
}
// on assigne aux joueurs leurs armes par défaut
assignDefaultWeapons();
const battle = new Battle(players, showWinner);
