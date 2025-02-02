"use client";

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Trophy, Timer, Award, Medal, CheckCircle2, XCircle, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

// Fallback quiz data in case API fails
const fallbackQuizData = {
  questions: [
    {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      correct_answer: "Paris"
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Mars", "Venus", "Jupiter", "Saturn"],
      correct_answer: "Mars"
    },
    {
      question: "What is the largest mammal in the world?",
      options: ["Blue Whale", "African Elephant", "Giraffe", "Polar Bear"],
      correct_answer: "Blue Whale"
    },
    {
      question: "Who painted the Mona Lisa?",
      options: ["Leonardo da Vinci", "Vincent van Gogh", "Pablo Picasso", "Michelangelo"],
      correct_answer: "Leonardo da Vinci"
    },
    {
      question: "What is the chemical symbol for gold?",
      options: ["Au", "Ag", "Fe", "Cu"],
      correct_answer: "Au"
    }
  ]
};

export default function Home() {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, []);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !showResults && !showFeedback) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            checkAnswer();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, timeLeft, showResults, showFeedback]);

  const fetchQuizData = async () => {
    try {
      const response = await fetch('/api/proxy');
      if (!response.ok) throw new Error('Failed to fetch quiz data');
      const data = await response.json();
      // console.log(data, 'check response');
      setQuizData(data);
      setLoading(false);
    } catch (err) {
      console.log('Using fallback data due to API error:', err.message);
      setQuizData(fallbackQuizData);
      setLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    // Only handle drops to the answer zone
    if (result.destination.droppableId === 'answer-zone') {
      const option = quizData.questions[currentQuestion].options[result.source.index];
      setSelectedAnswer(option);
    }
  };

  const startQuiz = () => {
    if (!quizData) return;
    setGameStarted(true);
    setSelectedAnswer(null);
    setAnswers(quizData.questions[currentQuestion].options.map((option, index) => ({
      id: `option-${index}`,
      content: option.description // Use the description property
    })));
  };
  
  const checkAnswer = () => {
    const correctAnswer = quizData.questions[currentQuestion].options.find(
      (option) => option.is_correct
    );
    
    // const selectedAnswer = answers[0].content;
    const isAnswerCorrect = selectedAnswer?.id === correctAnswer.id;
  
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
  
    if (isAnswerCorrect) {
      setScore(score + Math.ceil(timeLeft / 2));
    }
  
    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestion + 1 < quizData.questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
        setSelectedAnswer(null);
        setAnswers(quizData.questions[currentQuestion + 1].options.map((option, index) => ({
          id: `option-${index}`,
          content: option.description
        })));
      } else {
        setShowResults(true);
      }
    }, isAnswerCorrect ? 2000 : 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full mx-4"
        >
          <Trophy className="w-16 h-16 text-purple-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Quiz Challenge</h1>
          <p className="text-gray-600 text-center mb-8">
            Test your knowledge and earn points! Drag and arrange answers, but be quick - time is ticking!
          </p>
          <button
            onClick={startQuiz}
            className="w-full py-4 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            Start Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  if (showResults) {
    const maxPossibleScore = quizData.questions.length * 15;
    const percentage = (score / maxPossibleScore) * 100;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full mx-4"
        >
          <Award className="w-16 h-16 text-purple-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Quiz Complete!</h2>
          <div className="flex justify-center items-center mb-8">
            <Medal className="w-8 h-8 text-yellow-500 mr-2" />
            <span className="text-4xl font-bold text-purple-500">{score}</span>
            <span className="text-gray-500 ml-2">points</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div 
              className="bg-purple-500 rounded-full h-4 transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <button
            onClick={() => {
              setGameStarted(false);
              setShowResults(false);
              setCurrentQuestion(0);
              setScore(0);
              setTimeLeft(30);
            }}
            className="w-full py-4 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Trophy className="w-6 h-6 text-purple-500 mr-2" />
            <span className="font-semibold text-lg">{score} points</span>
          </div>
          <div className="flex items-center">
            <Timer className="w-6 h-6 text-purple-500 mr-2" />
            <span className="font-semibold text-lg">{timeLeft}s</span>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Question {currentQuestion + 1} of {quizData.questions.length}
          </h2>
          <p className="text-purple-500 font-bold text-lg">{quizData.questions[currentQuestion].description}</p>
        </div>

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-4 ${
              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <div className="flex items-center">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 mr-2 text-red-600" />
              )}
              <span className="font-medium">
                {isCorrect ? 'Correct!' : `Incorrect. The correct answer is "${quizData.questions[currentQuestion].detailed_solution}"`}
              </span>
            </div>
          </motion.div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Answer Drop Zone */}
          <Droppable droppableId="answer-zone">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`mb-8 p-8 rounded-xl border-2 border-dashed ${
                  selectedAnswer 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400 transition-colors'
                } text-center`}
              >
                {selectedAnswer ? (
                  <div className="p-4 bg-white rounded-lg border-2 border-purple-500">
                    {selectedAnswer.description}
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <UploadCloud className="w-12 h-12 mx-auto mb-4" />
                    <p>Drag your answer here</p>
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Options List */}
          <Droppable droppableId="options" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-2 gap-4"
              >
                {quizData.questions[currentQuestion].options.map((option, index) => (
                  <Draggable key={option.id} draggableId={option.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-4 bg-white rounded-lg border-2 border-gray-200 cursor-grab hover:border-purple-500 transition-colors"
                      >
                        {option.description}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button
          onClick={checkAnswer}
          className={`w-full mt-8 py-4 text-white rounded-lg font-semibold transition-colors ${
            selectedAnswer 
              ? 'bg-purple-500 hover:bg-purple-600' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!selectedAnswer}
        >
          {currentQuestion + 1 === quizData.questions.length ? 'Finish Quiz' : 'Submit Answer'}
        </button>
      </div>
    </div>
  );
}