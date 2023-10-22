interface GameRecord {
  level: number;
  score: number;
  duration: number;
}

class GameRecorder {
  level: number;
  private score: number;
  private duration: number;
  private currentTime: number;
  private timerInterval?: number;
  private isTimerRunnig: boolean;

  constructor(level: number) {
    this.level = level;
    this.score = 0;
    this.duration = 0;
    this.currentTime = 0;
    this.timerInterval = undefined;
    this.isTimerRunnig = false;
    this.render();
  }

  getCurrentTime() {
    return this.currentTime;
  }

  getIsTimerRunning() {
    return this.isTimerRunnig;
  }

  startLevel() {
    this.isTimerRunnig = true;
    this.timerInterval = setInterval(() => {
      this.currentTime++;
      this.render();
    }, 1000);
  }

  endLevel() {
    this.isTimerRunnig = false;
    this.duration = this.currentTime;
    clearInterval(this.timerInterval);
    this.render();
  }

  updateScore(increment: number) {
    this.score = this.score + increment;
    this.render();
  }

  saveRecord() {
    const record: GameRecord = {
      level: this.level,
      score: this.score,
      duration: this.duration,
    };
    const currentRecords: string = localStorage.getItem("scoreboard") ?? "[]";
    const parsedCurrentRecords: GameRecord[] = JSON.parse(currentRecords);
    parsedCurrentRecords.unshift(record);
    localStorage.setItem("scoreboard", JSON.stringify(parsedCurrentRecords));
  }

  render() {
    const levelElement = document.getElementById("level");
    const scoreElement = document.getElementById("score");
    const durationElement = document.getElementById("duration");

    if (levelElement) {
      levelElement.innerHTML = this.level.toString();
    }
    if (scoreElement) {
      scoreElement.innerHTML = this.score.toString();
    }
    if (durationElement) {
      durationElement.innerHTML = this.currentTime.toString() + " seconds";
    }
  }
}

export default GameRecorder;
