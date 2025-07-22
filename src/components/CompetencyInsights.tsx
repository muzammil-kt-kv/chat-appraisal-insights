import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

interface CoverageArea {
  area: string;
  explanation: string;
}

interface CoverageAnalysis {
  covered_areas: CoverageArea[];
  total_areas_covered: number;
  summary: string;
}

interface CompetencyInsightsProps {
  coverageAnalysis: CoverageAnalysis | null;
  isLoading?: boolean;
}

const CompetencyInsights: React.FC<CompetencyInsightsProps> = ({
  coverageAnalysis,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Analyzing Competencies...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!coverageAnalysis) {
    return null;
  }

  const competencyAreas = [
    "Technical Skills",
    "Functional Understanding",
    "AI Adoption",
    "Communication",
    "Energy & Drive",
    "Responsibilities & Trust",
    "Teamwork",
    "Managing Processes & Work",
  ];

  const coveredAreaNames = coverageAnalysis.covered_areas.map(
    (area) => area.area
  );
  const uncoveredAreas = competencyAreas.filter(
    (area) => !coveredAreaNames.includes(area)
  );

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Competency Coverage Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Coverage</span>
                <span className="text-sm text-muted-foreground">
                  {coverageAnalysis.total_areas_covered} of{" "}
                  {competencyAreas.length} areas
                </span>
              </div>
              <Progress
                value={
                  (coverageAnalysis.total_areas_covered /
                    competencyAreas.length) *
                  100
                }
                className="h-2"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {coverageAnalysis.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Covered Areas */}
      {coverageAnalysis.covered_areas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Covered Competencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coverageAnalysis.covered_areas.map((area, index) => (
                <div
                  key={index}
                  className="p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">
                        {area.area}
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        {area.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uncovered Areas */}
      {uncoveredAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              Areas to Explore
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uncoveredAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-200"
                >
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    {area}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Consider sharing more about these areas to provide a comprehensive
              self-assessment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompetencyInsights;
