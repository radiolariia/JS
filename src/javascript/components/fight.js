import { controls } from '../../constants/controls';

const {
  PlayerOneAttack,
  PlayerOneBlock,
  PlayerTwoAttack,
  PlayerTwoBlock,
  PlayerOneCriticalHitCombination,
  PlayerTwoCriticalHitCombination,
} = controls;

export async function fight(selectedFighters) {
  const [firstFighter, secondFighter] = selectedFighters;
  const playerOne = createPlayer(firstFighter);
  const playerTwo = createPlayer(secondFighter);
  
  return new Promise(resolve => {
    // resolve the promise with the winner when fight is over
    const pressedKeys = new Set();

    document.addEventListener('keydown', (e) => {
      pressedKeys.add(e.code);
      
      handlePunches(playerOne, playerTwo, pressedKeys);

      if (playerOne.currentHealth <= 0 || playerTwo.currentHealth <= 0) {
        const winner = playerOne.currentHealth <= 0 ? secondFighter : firstFighter;
        resolve(winner);
      };
    });
    
    document.addEventListener('keyup', (e) => {
      //prevent sticky keys
      pressedKeys.delete(e.code);
    });
  });
}
function createPlayer(fighter) {
  return {
    ...fighter,
    currentHealth: fighter.health,
    lastCriticalHit: new Date(0),
    setCriticalHitTimer() {
      this.lastCriticalHit = new Date();
    }
  }
}
function handlePunches(firstFighter, secondFighter, pressedKeys) {
  const leftHealthIndicator = document.getElementById('left-fighter-indicator');
  const rightHealthIndicator = document.getElementById('right-fighter-indicator');
  
  switch(true) {
    case pressedKeys.has(PlayerOneAttack): {
      controlFighterAttack(firstFighter, secondFighter, rightHealthIndicator, pressedKeys);
    };
    break;
    case pressedKeys.has(PlayerTwoAttack): {
      controlFighterAttack(secondFighter, firstFighter, leftHealthIndicator, pressedKeys);
    };
    break;
    case PlayerOneCriticalHitCombination.every(key => pressedKeys.has(key)): {
      controlFighterCriticalAttack(firstFighter, secondFighter, rightHealthIndicator);
    };
    break;
    case PlayerTwoCriticalHitCombination.every(key => pressedKeys.has(key)): {
      controlFighterCriticalAttack(secondFighter, firstFighter, leftHealthIndicator);
    };
    break;
  };
}
function controlFighterAttack(attacker, defender, healthIndicator, pressedKeys) {
  if (isBlocked(pressedKeys)) return
  defender.currentHealth -= getDamage(attacker, defender);
    updateHealthIndicator(defender, healthIndicator);
}

function controlFighterCriticalAttack(attacker, defender, healthIndicator) {
  if (isCriticalHitInTime(attacker)) {
    defender.currentHealth -= attacker.attack * 2;
    updateHealthIndicator(defender, healthIndicator);
    
    attacker.setCriticalHitTimer();
  }
}
function isBlocked(pressedKeys) {
  return pressedKeys.has(PlayerOneBlock) || pressedKeys.has(PlayerTwoBlock);
}
function isCriticalHitInTime(attacker) {
  const interval = (new Date().getTime() - attacker.lastCriticalHit.getTime()) / 1000;
  return interval > 10;
}
function updateHealthIndicator(defender, indicator) {
  const indicatorWidth = Math.max(0, (defender.currentHealth / defender.health) * 100);
  indicator.style.width = indicatorWidth + '%';
} 
function getDamage(attacker, defender) {
  // return damage
  const hitPower = getHitPower(attacker);
  const blockPower = getBlockPower(defender);
  return blockPower < hitPower ? hitPower - blockPower : 0
}
function getHitPower(fighter) {
  console.log(fighter)
  // return hit power
  const criticalHitChance = getChance(1, 2);
  return fighter.attack * criticalHitChance;
}
function getBlockPower(fighter) {
  // return block power
  const dodgeChance = getChance(1,2);
  return fighter.defense * dodgeChance;
}
function getChance(min, max) {
  return Math.random() * (max - min) + min;
}