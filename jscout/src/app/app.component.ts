import { Component }       from '@angular/core';

import { QuestionService } from './question.service';

import { CheckForUpdateService } from './updates.service';
import { LogUpdateService } from './updates.service';
import { PromptUpdateService } from './updates.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:  [QuestionService]
})
export class AppComponent {
  setupQuestions: any[];
  autoQuestions: any[];
  teleopQuestions: any[];
  endgameQuestions: any[];

  title = 'StrangeScout';
  year = '2018';
  game = 'Power Up';

  visiblePage = 'splash';

  constructor(service: QuestionService) {
    this.setupQuestions = service.getSetupQuestions();
    this.autoQuestions = service.getAutoQuestions();
    this.teleopQuestions = service.getTeleopQuestions();
    this.endgameQuestions = service.getEndgameQuestions();
  }

  ngOnInit () {
    CheckForUpdateService;
    LogUpdateService;
    PromptUpdateService;
  }

}
