'use client';

import { useState, useEffect } from 'react';
import * as bip39 from 'bip39';

function generateStrongerPassword(length: number): string {
  const mnemonic = bip39.generateMnemonic();
  const words = mnemonic.split(' ');

  // 길이에 따라 단어 수 조절
  let wordCount;
  if (length <= 12) wordCount = 3;
  else if (length <= 18) wordCount = 4;
  else if (length <= 24) wordCount = 5;
  else wordCount = 6;

  // 단어들 선택
  const selectedWords = words
    .sort(() => Math.random() - 0.5)
    .slice(0, wordCount)
    .map((word, index) => {
      const segment = word.slice(0, Math.random() > 0.5 ? 10 : 15);
      // 첫 단어는 소문자, 나머지는 랜덤하게 대소문자
      return index === 0 ? segment.toLowerCase() :
        (Math.random() > 0.5 ? segment.toUpperCase() : segment);
    });

  // 단어들 사이에 특수문자 또는 숫자 삽입
  const separators = ['_', '-', 'number'];
  let result = selectedWords[0];
  let numberCount = 0;

  for (let i = 1; i < selectedWords.length; i++) {
    const separator = separators[Math.floor(Math.random() * separators.length)];
    if (separator === 'number' && numberCount < 2) {
      result += Math.floor(Math.random() * 10).toString();
      numberCount++;
    } else {
      result += (separator === 'number' ? '_' : separator);
    }
    result += selectedWords[i];
  }

  // 숫자가 2개 미만이면 마지막에 부족한 만큼 추가
  while (numberCount < 2) {
    result += Math.floor(Math.random() * 10).toString();
    numberCount++;
  }

  return result.slice(0, length);
}

export default function Home() {
  const [passwords, setPasswords] = useState<{ [key: number]: string }>({});
  const [copiedLength, setCopiedLength] = useState<number | null>(null);

  // useEffect를 추가하여 컴포넌트 마운트 시 비밀번호 생성
  useEffect(() => {
    generatePasswords();
  }, []);

  // 복사 성공 시 표시된 메시지를 3초 후에 제거하는 효과 추가
  useEffect(() => {
    if (copiedLength !== null) {
      const timer = setTimeout(() => {
        setCopiedLength(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copiedLength]);

  const generatePasswords = () => {
    // 16: 많은 서비스에서 권장하는 최소 길이
    // 20: NIST 권장 길이
    // 28: 고보안이 필요한 경우
    const lengths = [12, 16, 18, 20, 24, 28, 32];
    const newPasswords = lengths.reduce((acc, length) => ({
      ...acc,
      [length]: generateStrongerPassword(length)
    }), {});
    setPasswords(newPasswords);
  };

  const handleCopy = (length: number, password: string) => {
    navigator.clipboard.writeText(password);
    setCopiedLength(length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            BIP39 단어 기반 비밀문구 생성기
          </h1>

          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            각 비밀문구는 BIP39 단어 목록에서 무작위로 선택된 단어들과 숫자를 조합하여 생성됩니다.
            <br className="hidden sm:block" />
            <span className="block mt-2 text-sm">
              • 16자리: 많은 서비스에서 권장하는 최소 길이
              <br />
              • 20자리: NIST(미국 표준 기술 연구소) 권장 길이
              <br />
              • 28자리: 고보안이 필요한 경우 권장 길이
            </span>
          </p>
          <button
            onClick={generatePasswords}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg 
                     shadow-md transition duration-200 ease-in-out transform hover:scale-105"
          >
            비밀문구 생성
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {Object.entries(passwords).map(([length, pass]) => (
            <div
              key={length}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleCopy(Number(length), pass)}
              role="button"
              tabIndex={0}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">
                  {length}자리 비밀문구
                </span>
                <div className="flex items-center gap-2">
                  {copiedLength === Number(length) && (
                    <span className="text-green-600 text-sm ml-2">복사됨!</span>
                  )}
                  <span className="font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded cursor-pointer hover:bg-gray-200">
                    {pass}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
