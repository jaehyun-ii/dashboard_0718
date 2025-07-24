"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "안녕하세요! 터빈 모니터링 시스템 챗봇입니다. 무엇을 도와드릴까요?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // 시뮬레이션된 봇 응답
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("터빈") || input.includes("turbine")) {
      return "현재 4개의 터빈(A, B, C, D)이 모니터링되고 있습니다. 특정 터빈에 대한 정보가 필요하시면 터빈명을 말씀해 주세요.";
    }

    if (input.includes("사이클") || input.includes("cycle")) {
      return "사이클 관련 정보를 확인하실 수 있습니다. 특정 사이클 번호나 날짜를 알려주시면 더 자세한 정보를 제공해드릴 수 있습니다.";
    }

    if (input.includes("상태") || input.includes("status")) {
      return "시스템 상태를 확인해드리겠습니다. 대시보드에서 실시간 상태를 모니터링하실 수 있으며, 현재 감지 페이지에서 더 자세한 정보를 확인하실 수 있습니다.";
    }

    if (
      input.includes("경고") ||
      input.includes("알람") ||
      input.includes("warning")
    ) {
      return "경고 알람은 시스템이 정상 범위를 벗어났을 때 발생합니다. 현재 감지 페이지에서 모든 경고 현황을 확인하실 수 있습니다.";
    }

    if (input.includes("보고서") || input.includes("report")) {
      return "보고서 페이지에서 다양한 형태의 분석 보고서를 생성하고 다운로드할 수 있습니다. 일간, 주간, 월간, 분기별 보고서를 제공합니다.";
    }

    return "죄송합니다. 해당 질문에 대한 답변을 찾을 수 없습니다. 터빈, 사이클, 상태, 경고, 보고서 등에 대해 질문해 주세요.";
  };

  const quickQuestions = [
    "현재 시스템 상태는?",
    "경고가 있는 터빈은?",
    "최신 사이클 정보",
    "보고서 생성 방법",
  ];

  return (
    <div className="flex-1 p-8 overflow-hidden flex flex-col">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-slate-800">챗봇</h1>
        <p className="text-2xl text-slate-600 mt-3">
          터빈 모니터링 시스템에 대해 궁금한 것을 물어보세요
        </p>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              대화
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto mb-4 p-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span className="text-lg opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xl">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <span className="text-xl">
                        응답을 생성하고 있습니다...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="메시지를 입력하세요..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Questions */}
        <Card className="w-80">
          <CardHeader>
            <CardTitle>빠른 질문</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start"
                  onClick={() => setInputText(question)}
                >
                  {question}
                </Button>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2 text-2xl">도움말</h4>
              <div className="text-xl text-slate-600 space-y-1">
                <p>• 터빈 상태 문의</p>
                <p>• 사이클 정보 조회</p>
                <p>• 경고 알람 확인</p>
                <p>• 보고서 생성 방법</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
