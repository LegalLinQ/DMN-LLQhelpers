/*
*  ©2017-2018 HBT Hamburger Berater Team GmbH
*  All Rights Reserved.
*/ //ommit TS 
//const DmnModdle = require('dmn-moddle');

const feel = require('./parserPEG');

function parseRule(rule, idx) {
  const parsedRule = { number: idx + 1, input: [], inputValues: [], output: [], outputValues: [] };
  if (rule.inputEntry) {
    rule.inputEntry.forEach((inputEntry) => {
      let text = inputEntry.text;
      if (text === '') {
        text = '-';
      }
      try {
        parsedRule.input.push(feel.parse(text, {
          startRule: 'SimpleUnaryTests',
        }));
        parsedRule.inputValues.push(text);
      } catch (err) {
        throw new Error(`Failed to parse input entry: ${text} ${err}`);
      }
    });
  }
  //LLQ addition || outputEntry.text.trim() == '-' (do not process - dashes)
  rule.outputEntry.forEach((outputEntry) => {
    if (!outputEntry.text || outputEntry.text.trim() == '-') {
      parsedRule.output.push(null);
      parsedRule.outputValues.push(null);
    } else {
      try {
        parsedRule.output.push(feel.parse(outputEntry.text, {
          startRule: 'SimpleExpressions',
        }));
      } catch (err) {
        throw new Error(`Failed to parse output entry: ${outputEntry.text} ${err}`);
      }
      parsedRule.outputValues.push(outputEntry.text);
    }
  });
  return parsedRule;
}

function parseDecisionTable(decisionId, decisionTable) {
  if ((decisionTable.hitPolicy !== 'FIRST') && (decisionTable.hitPolicy !== 'UNIQUE')
      && (decisionTable.hitPolicy !== 'COLLECT') && (decisionTable.hitPolicy !== 'RULE ORDER')) {
    throw new Error(`Unsupported hit policy ${decisionTable.hitPolicy}`);
  }
  const parsedDecisionTable = { hitPolicy: decisionTable.hitPolicy, rules: [], inputExpressions: [], parsedInputExpressions: [], outputNames: [] };

  // parse rules (there may be none, though)
  if (decisionTable.rule === undefined) {
    console.warn(`The decision table for decision '${decisionId}' contains no rules.`);
  } else {
    decisionTable.rule.forEach((rule, idx) => {
      parsedDecisionTable.rules.push(parseRule(rule, idx));
    });
  }

  // parse input expressions
  if (decisionTable.input) {
    decisionTable.input.forEach((input) => {
      let inputExpression;
      if (input.inputExpression && input.inputExpression.text) {
        inputExpression = input.inputExpression.text;
      } else if (input.inputVariable) {
        inputExpression = input.inputVariable;
      } else {
        throw new Error(`No input variable or expression set for input '${input.id}'`);
      }
      parsedDecisionTable.inputExpressions.push(inputExpression);
      try {
        parsedDecisionTable.parsedInputExpressions.push(feel.parse(inputExpression, {
          startRule: 'SimpleExpressions',
        }));
      } catch (err) {
        throw new Error(`Failed to parse input expression '${inputExpression}': ${err}`);
      }
    });
  }

  // parse output names
  decisionTable.output.forEach((output) => {
    if (output.name) {
      parsedDecisionTable.outputNames.push(output.name);
    } else {
      throw new Error(`No name set for output "${output.id}"`);
    }
  });
  return parsedDecisionTable;
}

function parseDecisions(drgElements) {
  const parsedDecisions = [];
  // iterate over all decisions in the DMN
  drgElements.forEach((drgElement) => {
    if (drgElement.decisionLogic) {
      // parse the decision table...
      const decision = { decisionTable: parseDecisionTable(drgElement.id, drgElement.decisionLogic), requiredDecisions: [] };
      // ...and collect the decisions on which the current decision depends
      if (drgElement.informationRequirement !== undefined) {
        drgElement.informationRequirement.forEach((req) => {
          if (req.requiredDecision !== undefined) {
            const requiredDecisionId = req.requiredDecision.href.replace('#', '');
            decision.requiredDecisions.push(requiredDecisionId);
          }
        });
      }
      parsedDecisions[drgElement.id] = decision;
    }
  });
  return parsedDecisions;
}


export default function parseModdle13(moddleObject) {
  return new Promise((resolve, reject) => {
    try {
      //original module requires a decisionTable where it is now decisionLogic, fixed in 'parseDecisions for the moment
      const decisions = parseDecisions(moddleObject.drgElement);
      resolve(decisions);
    } catch (err) {
      reject(err);
    }
  });
}
