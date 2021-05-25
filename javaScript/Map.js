class GameMap {
  constructor(container, size, players) {
    this.gameboard = document.querySelector(container);
    if (!size || size < 3)
      throw new Error("Cannot have empty or too small map");
    this.size = size;
    // Conditions pour vérifier si le nombre de joueur n'est pas inférieur à 2
    if (!players || players.length < 2) throw new Error("Cannot play alone");
    this.players = players;
    this.weapons = WEAPONS.filter((w) => w.dmg !== 10).map((w) =>
      Object.assign({}, w)
    );
    this.obstaclesPositions = [];
    this.weaponsItems = [];
    this.enemyPosition = [];
  }

  get cellsCount() {
    if (!this.size) return 0;
    return this.size * this.size;
  }

  // Fonction permettant de créer la grille et ses éléments
  createMap() {
    this.createGrid();
    this.createObstacles();
    this.createWeapons();
    this.createPlayers();
  }

  createGrid() {
    let line = document.createElement("div");
    line.classList = "line";
    for (let i = 0; i < this.cellsCount; i++) {
      const cell = this.createCell();
      cell.classList = "cellnumber-" + (i + 1);
      line.appendChild(cell);
      if ((i + 1) % this.size === 0 && i !== 0) {
        this.gameboard.appendChild(line);
        line = document.createElement("div");
        line.classList = "line";
      }
    }
  }

  createObstacles() {
    for (let i = 10; i > 0; i--) {
      const result = this.tryToPlaceItem("obstacle", "./img/floor/trou.png");
      this.obstaclesPositions.push(result.position);
    }
  }

  createWeapons() {
    this.weapons.forEach((weapon) => {
      const result = this.tryToPlaceItem("weapon", weapon.imgSrc);
      this.weaponsItems.push({ weapon: weapon, div: result.div });
    });
  }

  createPlayers() {
    const positions = [];
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];

      // On place le joueur sans le coller aux autres joueurs
      const item = this.tryToPlaceItem("player", player.imgSrc, positions);
      const position = item.position;

      const div = item.div;
      player.position = item.position;

      // On ajoute les positions adjacentes au joueur que l'on vient de placer
      // dans les positions exclues pour les autres joueurs
      positions.push(
        position - this.size,
        position - 1,
        position,
        position + 1,
        position + this.size
      );
      player.div = div;
    }
  }

  // Fonction permettant de créer les div en HTML, utilisées pour créer le bg
  createCell(classList, bgImgSrc) {
    const cell = document.createElement("div");
    // On ajoute une classe à l'élément HTML
    if (classList) {
      cell.classList = classList;
    }
    // On ajoute une image de fond à l'élément HTML
    if (bgImgSrc) {
      cell.style.backgroundImage = `url('${bgImgSrc}')`;
    }
    return cell;
  }

  // Fonction récursive essayant de placer un objet sur une case de la map
  tryToPlaceItem(itemClass, itemBgImgSrc, listOfPositionToExclude) {
    // On choisit une case aléatoire sur laquelle placer l'item
    const cellNumberWhereToPlace = this.randomNumber(this.cellsCount - 1);
    // On vérifie si la cellule n'est pas exclue des positions données
    // Si oui on retente l'opération
    if (
      listOfPositionToExclude &&
      listOfPositionToExclude.includes(cellNumberWhereToPlace)
    ) {
      return this.tryToPlaceItem(
        itemClass,
        itemBgImgSrc,
        listOfPositionToExclude
      );
    }

    // On récupére l'élément HTML correspondant
    const cellWhereToPlace = this.gameboard.querySelector(
      `div.cellnumber-${cellNumberWhereToPlace}`
    );

    // On vérifie si la cellule contient déjà quelque chose
    const alreadySomethingInTheCell =
      cellWhereToPlace.querySelector("div") != null;

    // Si oui on retente l'opération
    if (alreadySomethingInTheCell) {
      return this.tryToPlaceItem(
        itemClass,
        itemBgImgSrc,
        listOfPositionToExclude
      );
    }
    // Sinon on ajoute l'item dans la cellule
    const cell = this.createCell(itemClass, itemBgImgSrc);
    cellWhereToPlace.appendChild(cell);
    return { position: cellNumberWhereToPlace, div: cell };
  }

  // Nombre aléatoire
  randomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
  }

  // Supprimer les cases marquées comme "possibles pour le déplacement"
  removePossibleCells() {
    this.gameboard
      .querySelectorAll('div[class*="possible"]')
      .forEach((element) => {
        element.classList.remove("possible-1");
        element.classList.remove("possible-2");
        element.classList.remove("possible-3");
      });
  }

  // Montrer les positions disponibles pour le joueur courant
  showAvailablePositionsForPlayer(currentPlayerIndex) {
    // A chaque fois qu'on appelle cette méthode on supprime celles actuellement colorées en premier
    this.removePossibleCells();

    const currentPlayer = this.players[currentPlayerIndex];
    const currentPlayerPosition = currentPlayer.position;
    const isPossiblePosition = (pos, checkIfSameLine = false) => {
      let isOnLine = true;
      // Si on a la position courante on veut vérifier que l'on est pas au bout d'une ligne (grille verticale)
      // dans le cas d'un déplacement vers le haut ou vers le bas
      if (checkIfSameLine) {
        //! On récupére le parent (div.line) de la cellule courante
        const currentParent = this.gameboard.querySelector(
          `div.cellnumber-${currentPlayerPosition}`
        ).parentNode;

        //! On essaye de récupérer la cellule voulue
        const wantedPosition = this.gameboard.querySelector(
          `div.cellnumber-${pos}`
        );
        //! On considére qu'on est sur la meme ligne si la cellule voulue existe et que la ligne parente est la même
        isOnLine =
          wantedPosition !== null &&
          currentParent === wantedPosition.parentNode;
      }

      return isOnLine && pos > 0 && pos <= this.cellsCount;
    };

    //! On vérifie que la cellule n'est pas un obstacle ou un joueur (considéré comme un obstacle)
    const isObstacle = (pos) => this.obstaclesPositions.includes(pos) || this.players.map(p => p.position).includes(pos);

    //! On compile les positions possible autour du joueur courant
    const positions = [];
    let obstacleUp = false;
    let obstacleRight = false;
    let obstacleDown = false;
    let obstacleLeft = false;
    for (let i = 1; i <= currentPlayer.stepsCount; i++) {
      //! On vérifie si la case au dessus est possible
      if (!obstacleUp && isPossiblePosition(currentPlayerPosition - i, true)) {
        obstacleUp = isObstacle(currentPlayerPosition - i);
        if (!obstacleUp) {
          positions.push({ position: currentPlayerPosition - i, index: i });
        }
      }
      //! On vérifie si la case de droite est possible
      if (
        !obstacleRight &&
        isPossiblePosition(currentPlayerPosition + i * this.size)
      ) {
        obstacleRight = isObstacle(currentPlayerPosition + i * this.size);
        if (!obstacleRight) {
          positions.push({
            position: currentPlayerPosition + i * this.size,
            index: i,
          });
        }
      }
      //! On vérifie si la case en bas est possible
      if (
        !obstacleDown &&
        isPossiblePosition(currentPlayerPosition + i, true)
      ) {
        obstacleDown = isObstacle(currentPlayerPosition + i);
        if (!obstacleDown) {
          positions.push({ position: currentPlayerPosition + i, index: i });
        }
      }
      //! On vérifie si la case de gauche est disponible
      if (
        !obstacleLeft &&
        isPossiblePosition(currentPlayerPosition - i * this.size)
      ) {
        obstacleLeft = isObstacle(currentPlayerPosition - i * this.size);
        if (!obstacleLeft) {
          positions.push({
            position: currentPlayerPosition - i * this.size,
            index: i,
          });
        }
      }
    }

    //! On marque les cellules "possible" pour indiquer qu'un déplacement est possible
    positions.forEach((p) => {
      this.gameboard
        .querySelector(`.cellnumber-${p.position}`)
        .classList.add(`possible-${p.index}`);
    });
  }

  //! Mouvement du joueur courant
  movePlayer(currentPlayerIndex, cellWhereToMove) {
    const currentPlayer = this.players[currentPlayerIndex];
    let playerMoved = 0;
    //! on supprime la div personnage du joueur
    currentPlayer.div.parentNode.removeChild(currentPlayer.div);
    //! on remplace la cellule dans laquelle le personnage s'est deplacé
    cellWhereToMove.insertBefore(currentPlayer.div, cellWhereToMove.firstChild);
    cellWhereToMove.classList.forEach((cell) => {
      if (cell.includes("cellnumber")) {
        let tiretIndex = cell.indexOf("-");
        currentPlayer.position = Number(
          cell.substring(tiretIndex + 1, cell.length)
        );
      }
      //! on renseigne la ClassName avec possible
      if (cell.includes("possible")) {
        playerMoved = Number(cell.substring(cell.length - 1));
      }
    });

    return playerMoved;
  }

  //! Remplacement de l'arme
  replaceWeaponDiv(weaponDivToReplace, playerWeapon) {
    const weaponItem = this.weaponsItems.find(
      (wi) => wi.div === weaponDivToReplace
    );
    const parent = weaponItem.div.parentNode;
    const weaponReplaced = Object.assign({}, weaponItem.weapon);
    const newWeaponDiv = this.createCell("weapon", playerWeapon.imgSrc);

    // On supprime l'image représentant l'arme
    parent.removeChild(weaponItem.div);
    // On ajoute la nouvelle image
    parent.appendChild(newWeaponDiv);
    // On conserve les nouvelles informations dans la liste weaponsItems
    weaponItem.div = newWeaponDiv;
    weaponItem.weapon = Object.assign({}, playerWeapon);

    return weaponReplaced;
  }

  //! Déterminer ennemi grâce à "currentPlayerIndex"
  getEnemyNextToPlayer(currentPlayerIndex) {
    // On part de la position du joueur en question
    const currentPlayer = this.players[currentPlayerIndex];
    const playerPosition = currentPlayer.position;
    // On crée une liste qui contient les positions possibles
    const positionsAround = [
      playerPosition - 1, // la case du dessus
      playerPosition + 1, // la case en dessous
      playerPosition + this.size, // la case à droite
      playerPosition - this.size, // la case à gauche
    ];

    // On crée une liste des autres joueurs
    const otherPlayers = this.players.filter((p) => p !== currentPlayer);

    // On retourne le résultat de la fonction .find qui renvoie l'élément trouvé ou null s'il n'est pas trouvé
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    return otherPlayers.find((p) => positionsAround.includes(p.position));
  }

  //! générer les information des blocs "Players"
  createInformationPlayer() {
    const weaponP1 = players[0].weapons;
    const weaponP2 = players[1].weapons;

    if (weaponP1) {
      const showDmg = weaponP1[0].dmg;
      const showNameWeapon = weaponP1[0].name;
      const showImg = weaponP1[0].imgSrc;

      document.querySelector(".damage_p1").innerHTML = "Dégâts: " + showDmg;
      document.querySelector(".weapon-name_p1").innerHTML = showNameWeapon;
      document.querySelector(".weapon-img_p1").src = showImg;
    }
    if (weaponP2) {
      const showDmg = weaponP2[0].dmg;
      const showNameWeapon = weaponP2[0].name;
      const showImg = weaponP2[0].imgSrc;

      document.querySelector(".damage_p2").innerHTML = "Dégâts: " + showDmg;
      document.querySelector(".weapon-name_p2").innerHTML = showNameWeapon;
      document.querySelector(".weapon-img_p2").src = showImg;
    }
  }

  // Supprimer les weapons de la map
  deleteWeapons() {
    // On récupère la liste des éléments (= div) correspondants aux armes
    // que l'on a conservé lors de l'appel a la fonction createWeapons
    const weaponsDivs = this.weaponsItems.map(wi => wi.div);

    // Pour chaque élément de la liste on le supprime du DOM
    // https://developer.mozilla.org/fr/docs/orphaned/Web/API/ChildNode/remove
    weaponsDivs.forEach(div => div.remove());
  }
}
