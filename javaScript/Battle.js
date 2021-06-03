class Battle {
  // on reçoit en paramètre les joueurs et la fonction a executer en cas de victoire
  constructor(players, showWinner) {
    this.movePhaseHandler = this.movePhase.bind(this);
    this.players = players;
    this.btnAttackP1 = document.querySelector(".attack_p1");
    this.btnAttackP2 = document.querySelector(".attack_p2");
    this.btnDefenseP1 = document.querySelector(".defense_p1");
    this.btnDefenseP2 = document.querySelector(".defense_p2");
    this.createMap();

    // on écoute un des évènements pour savoir si le joueur courant attaque ou défend
    //! Si le player a cliqué sur attaque on attaque l'adversaire
    [this.btnAttackP1, this.btnAttackP2].forEach((attackDiv) => {
      attackDiv.addEventListener("click", () => {
        //! on récupère le joueur courant
        const currentPlayerIndex = this.getCurrentPlayer();
        const currentPlayer = this.players[currentPlayerIndex];
        //! on récupère les dommages du joueur courant
        const dmg = currentPlayer.totalDmg;
        //! on récupère l'autre joueur
        const enemy = this.map.getEnemyNextToPlayer(currentPlayerIndex);

        //! le joueur attaque, il n'est donc pas en mode défense
        currentPlayer.defense = false;

        //! Si l'adversaire est en mode defense on lui inflige
        enemy.getHit(dmg);
        //! on met à jour les points de vie dans les balises HTML
        this.updatePvInformation(currentPlayerIndex, enemy.pv);

        //! on vérifie si l'adversaire est mort
        if (enemy.pv <= 0) {
          const winner = currentPlayer.name;
          showWinner(winner);
        } else if (enemy.pv > 0) {
          this.nextPlayerToAttack(currentPlayerIndex);
        }
      });
    });

    //! Si le player a cliqué sur défendre il se met en mode défense
    [this.btnDefenseP1, this.btnDefenseP2].forEach((defenseDiv) => {
      defenseDiv.addEventListener("click", () => {
        const currentPlayerIndex = this.getCurrentPlayer();
        this.players[currentPlayerIndex].defense = true;

        //! Le joueur courant change
        this.nextPlayerToAttack(currentPlayerIndex);
      });
    });
  }

  createMap() {
    // paramètre1 = element HTML / 2 = nombre de case / 3 = players / 4 = nombre d'obstacles
    this.map = new GameMap("#gameboard", 10, this.players, 10);
  }
  // on initialise le debut du jeu
  start() {
    this.map.createMap();
    this.map.showAvailablePositionsForPlayer(this.getCurrentPlayer());
    this.map.gameboard.addEventListener("click", this.movePhaseHandler);
  }
  // on recharge la gameboard
  reload() {
    this.removeMap();
    this.createMap();
    this.start();
  }
  // on vide la map lorsqu'on veut rejouer (suppression des div "possible" et div "weapon")
  removeMap() {
    const el = this.map.gameboard;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  //! on gère le deplacement des joueurs
  movePhase(event) {
    //! on passe les conditions pour autoriser les déplacements sur les cases "possible" ou "weapon"
    const element = event.target;
    // on crée une fonction helper qui va nous servir a vérifier si l'élément cliqué ou son parent sont des cases possibles
    const isPossible = (elem) =>
      elem.classList.contains("possible-1") ||
      elem.classList.contains("possible-2") ||
      elem.classList.contains("possible-3");
    // on vérifie si la case cliquée est marquée comme "possible"
    const isPossibleCell = isPossible(element);
    // on garde l'information de si la case cliquée est une arme
    const isWeapon = element.classList.contains("weapon");
    // on vérifie si la case cliquée est une arme et si son parent est une case possible
    const isPossibleWeapon = isWeapon && isPossible(element.parentNode);

    // on accepte de se déplacer si les conditions sont remplies
    if (!isPossibleCell && !isPossibleWeapon) {
      console.log("Not possible cell : ", element);
      return;
    }
    //! on récupère le joueur courant
    let current = this.getCurrentPlayer();

    //! on récupère le N° de case ou se trouve mon joueur courant pour le faire se déplacer
    let cellWhereToMove = element;
    if (isWeapon) {
      cellWhereToMove = element.parentNode;
    }
    const playerMoved = this.map.movePlayer(current, cellWhereToMove);
    if (!playerMoved) {
      return;
    }

    //! Le joueur courant a fait un pas ou plus
    const currentPlayer = this.players[current];
    currentPlayer.stepsCount -= playerMoved;

    //! Si il a rencontré une arme dans son passage on lui remplace
    if (isWeapon) {
      const weapon = this.map.replaceWeaponDiv(
        element,
        currentPlayer.currentWeapon
      );
      currentPlayer.changeWeapon(weapon);
      // On met à jour les informations de l'arme du joueur courant
      this.updateWeaponInformation(current);
    }

    // on essaye de récupérer l'ennemi a coté du joueur courant si il y en a un
    const enemy = this.map.getEnemyNextToPlayer(current);

    //! c'est au joueur suivant de joueur
    this.nextPlayerToMove(current);
    current = this.getCurrentPlayer();

    // Si on voulait que le joueur puisse se déplacer tant qu'il a des "pas" disponibles
    // if (currentPlayer.stepsCount <= 0) {
    //   this.nextPlayerToMove(current);
    //   current = this.getCurrentPlayer();
    // }

    //! Si il s'est arrêté sur une cellule adjacente à un autre player on passe en mode combat
    if (enemy) {
      //! on supprime les cellules marquées comme possibles pour le joueur courant
      this.map.removePossibleCells();
      //! on supprime les weapons de la map
      this.map.deleteWeapons();
      //! on affiche les boutons  attaque et défense pour le joueur courant
      this.displayBtnAttkDef(current);
      //! on arrête d'écouter les évenements de déplacement
      this.map.gameboard.removeEventListener("click", this.movePhaseHandler);
      showFightBegins();
    } else {
      //! Sinon on présente les positions possibles pour le joueur suivant
      this.map.showAvailablePositionsForPlayer(current);
    }
  }

  //! on obtient l'index du joueur commencant la partie (player1 qui est à "true")
  getCurrentPlayer() {
    return this.players.findIndex((p) => p.turnToPlay === true);
  }

  // affiche les informations de l'arme portée par le joueur courant
  updateWeaponInformation(playerIndex) {
    const weapon = this.players[playerIndex].currentWeapon;
    let dmgDiv, nameDiv, imgDiv;

    if (playerIndex === 0) {
      dmgDiv = ".damage_p1";
      nameDiv = ".weapon-name_p1";
      imgDiv = ".weapon-img_p1";
    } else if (playerIndex === 1) {
      dmgDiv = ".damage_p2";
      nameDiv = ".weapon-name_p2";
      imgDiv = ".weapon-img_p2";
    }
    // un peu de jquery !!!
    $(dmgDiv).html("Dégâts: " + weapon.dmg);
    $(nameDiv).html(weapon.name);
    $(imgDiv).attr("src", weapon.imgSrc);
  }

  // affiche les informations des pv
  updatePvInformation(playerIndex, pv) {
    if (playerIndex === 0) {
      $(".life_point_p2").html("Points de vie : " + pv);
    } else if (playerIndex === 1) {
      $(".life_point_p1").html("Points de vie : " + pv);
    }
  }
  // on met le player à jour : information de l'arme et information des pv
  updatePlayersInformation() {
    this.players.forEach((player, index) => {
      this.updateWeaponInformation(index);
      this.updatePvInformation(index, player.pv);
    });
  }

  //! on initialise le joueur suivant ( player1 ou player2)
  nextPlayerToPlay(current) {
    if (current === 0) {
      this.players[1].turnToPlay = true;
      this.players[0].turnToPlay = false;
    } else if (current === 1) {
      this.players[0].turnToPlay = true;
      this.players[1].turnToPlay = false;
    }
  }
  //! on initialise le joueur suivant et réinitialise le nombre de pas possible pour le joueur qui vient de finir son tour
  nextPlayerToMove(current) {
    this.nextPlayerToPlay(current);
    if (current === 0) {
      this.players[0].stepsCount = players[0].abilityToMove;
    } else if (current === 1) {
      this.players[1].stepsCount = players[1].abilityToMove;
    }
  }

  //! affiche les boutons d'actions au joueur courant
  displayBtnAttkDef(current) {
    if (current === 0) {
      // On affiche les boutons pour le joueur 1
      this.btnAttackP1.style.display = "block";
      this.btnDefenseP1.style.display = "block";
      // On cache les boutons pour le joueur 2
      this.btnAttackP2.style.display = "none";
      this.btnDefenseP2.style.display = "none";
    } else if (current === 1) {
      // On affiche les boutons pour le joueur 2
      this.btnAttackP2.style.display = "block";
      this.btnDefenseP2.style.display = "block";
      // On cache les boutons pour le joueur 1
      this.btnAttackP1.style.display = "none";
      this.btnDefenseP1.style.display = "none";
    }
  }

  //! on initialise le joueur suivant ( player1 ou player2)
  nextPlayerToAttack(currentPlayer) {
    this.nextPlayerToPlay(currentPlayer);
    currentPlayer = this.getCurrentPlayer();
    this.displayBtnAttkDef(currentPlayer);
  }
}
