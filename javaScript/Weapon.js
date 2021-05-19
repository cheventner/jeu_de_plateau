class Weapon {
  constructor(name, imgSrc, dmg) {
    this.name = name;
    this.imgSrc = imgSrc;
    this.dmg = dmg;
  }
}
const WEAPONS = [
  new Weapon("Spirale de feu", "./img/weapons/feu.png", 10),
  new Weapon("Avalanche de Glace", "./img/weapons/glace.png", 10),
  new Weapon("Eclair foudroyant", "./img/weapons/orage.png", 15),
  new Weapon("Tourbillon de vent", "./img/weapons/tornade.png", 20),
  new Weapon("Force du Tsunami", "./img/weapons/tsunami.png", 25),
  new Weapon("Eruption du volcan", "./img/weapons/volcan.png", 30),
];
