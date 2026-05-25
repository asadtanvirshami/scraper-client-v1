"use client";

import React, { useState, useEffect } from "react";
import { Card, Steps, message, Spin } from "antd";
import { useIntl } from "react-intl";
import { useRouter } from "next/navigation";

import { useUpdateOnboarding } from "@/features/onboarding/hooks";
import { useUserInfo } from "@/helpers/use-user";
import LanguageSwitcher from "@/components/ui (generic)/language-swticher";
import { ThemeModeButton } from "@/components/layout/app-header/header-menu";
import Step1Form from "./ui/step1-form";
import Step2Form from "./ui/step2-form";


const OnboardingLayout: React.FC = () => {
  const intl = useIntl();
  const router = useRouter();
  const { is_onboarding_completed, user } = useUserInfo();
  const [currentStep, setCurrentStep] = useState(0);
  const [step1Data, setStep1Data] = useState<{ heard_about?: string }>({});
  const [step2Data, setStep2Data] = useState<{ business_name?: string; business_website?: string }>({});

  const updateOnboardingMutation = useUpdateOnboarding();

  useEffect(() => {
    if (is_onboarding_completed) {
      router.replace("/dashboard");
    }
  }, [is_onboarding_completed, router]);

  useEffect(() => {
    if (user?.heard_about) {
      setStep1Data({ heard_about: user.heard_about });
      setCurrentStep(1);
    }
    if (user?.business_name && user?.business_website) {
      setStep2Data({
        business_name: user.business_name,
        business_website: user.business_website,
      });
    }
  }, [user]);

  const handleStep1Submit = async (data: { heard_about: string }) => {
    try {
      await updateOnboardingMutation.mutateAsync({
        step: 1,
        heard_about: data.heard_about as any,
      });
      setStep1Data(data);
      setCurrentStep(1);
      message.success(
        intl.formatMessage({
          id: "onboarding.step1.success",
          defaultMessage: "Step 1 completed successfully!",
        }),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: "onboarding.step1.error",
          defaultMessage: "Failed to save step 1 data.",
        }),
      );
    }
  };

  const handleStep2Submit = async (data: { business_name?: string; business_website?: string }) => {
    try {
      await updateOnboardingMutation.mutateAsync({
        step: 2,
        business_name: data.business_name,
        business_website: data.business_website,
      });
      setStep2Data(data);
      message.success(
        intl.formatMessage({
          id: "onboarding.step2.success",
          defaultMessage: "Onboarding completed successfully!",
        }),
      );
      router.push("/dashboard");
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: "onboarding.step2.error",
          defaultMessage: "Failed to complete onboarding.",
        }),
      );
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (is_onboarding_completed) {
    return null; // Will redirect via useEffect
  }

  const steps = [
    {
      title: intl.formatMessage({
        id: "onboarding.step1.title",
        defaultMessage: "How did you hear about us?",
      }),
      content: <Step1Form onSubmit={handleStep1Submit} initialData={step1Data} />,
    },
    {
      title: intl.formatMessage({
        id: "onboarding.step2.title",
        defaultMessage: "Tell us about your business",
      }),
      content: <Step2Form onSubmit={handleStep2Submit} onPrev={handlePrev} initialData={step2Data} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f5f8] p-4 text-gray-900 transition-colors dark:bg-[#0b0b0f] dark:text-white">
      <div className="mx-auto flex w-full max-w-5xl justify-end gap-3 pb-4">
        <LanguageSwitcher />
        <ThemeModeButton />
      </div>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-4xl border border-gray-200/80 bg-white/95 shadow-[0_30px_80px_rgba(0,0,0,0.10)] dark:border-white/10 dark:bg-[#151519]/95 dark:shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center mb-2">
            {intl.formatMessage({
              id: "onboarding.title",
              defaultMessage: "Welcome to DataHarvX!",
            })}
          </h1>
          <p className="text-center text-gray-600 dark:text-white/60">
            {intl.formatMessage({
              id: "onboarding.subtitle",
              defaultMessage: "Let's get you set up in just a few steps.",
            })}
          </p>
        </div>

        <Steps
          current={currentStep}
          className="mb-8"
          items={steps.map((step) => ({ title: step.title }))}
        />

        <div className="min-h-[300px]">
          {steps[currentStep].content}
        </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingLayout;
