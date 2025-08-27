import React, { useState } from 'react';
import { RotateCcw, Trophy, X } from 'lucide-react';

interface TicTacToeProps {
  playerName: string;
  opponentName: string;
  onClose: () => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ playerName, opponentName, onClose }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [scores, setScores] = useState({ player: 0, opponent: 0 });
  
  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };
  
  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? '❌' : '⭕';
    setBoard(newBoard);
    
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner === '❌') {
        setScores({ ...scores, player: scores.player + 1 });
      } else {
        setScores({ ...scores, opponent: scores.opponent + 1 });
      }
    } else if (newBoard.every(square => square !== null)) {
      setWinner('draw');
    }
    
    setIsXNext(!isXNext);
  };
  
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };
  
  const renderSquare = (index: number) => (
    <button
      key={index}
      onClick={() => handleClick(index)}
      className="w-20 h-20 bg-white border-2 border-purple-300 rounded-xl flex items-center justify-center text-3xl font-bold hover:bg-purple-50 transition-colors transform hover:scale-105"
      style={{ fontSize: '2rem' }}
    >
      {board[index]}
    </button>
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold gradient-text">Tic Tac Toe Battle! ⚔️</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="bg-white/80 rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-center">
              <p className="text-sm text-gray-600">❌ {playerName}</p>
              <p className="text-2xl font-bold text-purple-600">{scores.player}</p>
            </div>
            <span className="text-2xl">VS</span>
            <div className="text-center">
              <p className="text-sm text-gray-600">⭕ {opponentName}</p>
              <p className="text-2xl font-bold text-pink-600">{scores.opponent}</p>
            </div>
          </div>
          
          {!winner && (
            <p className="text-center text-sm font-medium text-gray-700">
              {isXNext ? playerName : opponentName}'s turn
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4 justify-center mx-auto" style={{ width: 'fit-content' }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSquare(i))}
        </div>
        
        {winner && (
          <div className="bg-white/90 rounded-xl p-4 mb-4 text-center">
            {winner === 'draw' ? (
              <p className="text-xl font-bold text-gray-700">It's a Draw! 🤝</p>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <p className="text-xl font-bold gradient-text">
                  {winner === '❌' ? playerName : opponentName} Wins! 🎉
                </p>
              </div>
            )}
          </div>
        )}
        
        <button
          onClick={resetGame}
          className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={20} />
          New Game
        </button>
        
        <p className="text-center text-xs text-gray-500 mt-4">
          Take a quick brain break! 🧠✨
        </p>
      </div>
    </div>
  );
};

export default TicTacToe;