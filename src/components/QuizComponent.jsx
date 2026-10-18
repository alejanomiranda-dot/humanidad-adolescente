import React, { useState } from 'react';
import { questions, quizResults } from '../content/quiz.js';

const QuizComponent = ({ onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQ]: value };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (ans) => {
    const total = Object.values(ans).reduce((a, b) => a + b, 0);
    const avg = total / questions.length;

    let result;
    if (avg <= 1.5) {
      result = { ...quizResults.earlyAdolescence };
    } else if (avg <= 2.5) {
      result = { ...quizResults.fullAdolescence };
    } else {
      result = { ...quizResults.emergingAdulthood };
    }
    onComplete(result);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Pregunta {currentQ + 1} de {questions.length}</span>
          <span>{Math.round(((currentQ) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
            style={{ width: `${((currentQ) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-6">{questions[currentQ].q}</h3>

      <div className="space-y-3">
        {questions[currentQ].options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option.value)}
            className="w-full p-4 text-left bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors border border-gray-600/50 hover:border-orange-500/50"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizComponent;
