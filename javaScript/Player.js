// Classe qui représente un joueur
// Il possède une arme par défaut
class Player {
  constructor(imgSrc, abilityToMove, turnToPlay = false) {
    this.name = "";
    this.imgSrc = imgSrc;
    this.weapons = []; // tableau des armes (pour évolution possible) si on souhaite que le joueur possède plusieurs armes
    this.pv = 100;
    this.position;
    this.abilityToMove = abilityToMove;
    this.stepsCount = abilityToMove;
    this.turnToPlay = turnToPlay;
    this.defense = false;
  }

  revive() {
    this.pv = 100;
  }

  addWeapon(weapon) {
    this.weapons.push(weapon);
  }

  changeWeapon(weapon) {
    this.weapons = [weapon];
  }

  getHit(dmg) {
    let dmgToTake = dmg;
    if (this.defense === true) {
      // lorsque le joueur est en mode défense il prend 50% de dégat de moins
      dmgToTake = Math.round(dmg / 2);

      this.defense = false;
    }
    // si les points de vie descendent en dessous de zero, on les garde a zéro (pour l'affichage)
    if (this.pv - dmgToTake < 0) {
      this.pv = 0;
    } else {
      this.pv -= dmgToTake;
    }
  }

  // on calcule l'attaque totale basée sur la somme des armes obtenues
  get totalDmg() {
    if (!this.weapons.length) return 0;
    return this.weapons.reduce((prev, current) => prev + current.dmg, 0);
  }
  // pour déterminer l'arme courante
  get currentWeapon() {
    if (!this.weapons.length) return null;
    return this.weapons[0];
  }
  // pour déterminer le joueur courant
  get isCurrentPlayer() {
    return this.turnToPlay === true;
  }
}
