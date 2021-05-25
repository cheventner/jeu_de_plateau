// Classe qui représente un joueur
// Il possède une arme par défaut
class Player {
  constructor(imgSrc, abilityToMove, turnToPlay = false) {
    this.name = "";
    this.imgSrc = imgSrc;
    this.weapons = [];
    this.pv = 100;
    this.position; // position des joueurs 52 --> 53 -->
    this.abilityToMove = abilityToMove; // capacité à se deplacer 3 cases
    this.stepsCount = abilityToMove; // 3 --> 2 --> 1 -- > 0 reset on repart à --> 2
    this.turnToPlay = turnToPlay; // tourner pour jouer  true --> true --> false
    this.mode = [];
  }

  addWeapon(weapon) {
    this.weapons.push(weapon);
  }

  changeWeapon(weapon) {
    this.weapons = [weapon];
  }

  getHit(dmg) {
    this.pv = this.pv - dmg;
    console.log(this.pv);
  }

  // On utilise une property get pour calculer l'atk totale basée sur la somme des armes obtenues
  // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Functions/get
  get totalDmg() {
    if (!this.weapons.length) return 0;
    return this.weapons.reduce((prev, current) => prev + current.dmg, 0);
  }

  get currentWeapon() {
    if (!this.weapons.length) return null;
    return this.weapons[0];
  }

  // On obtient la défense totale basée sur la moitiée de l'atk totale
  get totalDefense() {
    // Voir Maths.abs (arrondir)
    return this.totalDmg / 2;
  }

  get isCurrentPlayer() {
    return this.turnToPlay === true;
  }
}
