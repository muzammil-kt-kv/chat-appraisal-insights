import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CompetencyScoreChartProps {
  data?: any[];
}

const CompetencyScoreChart = ({ data }: CompetencyScoreChartProps) => {
  // Mock data for demonstration - in real implementation, this would come from ai_scores_json in Supabase
  const mockData = [
    {
      scoreRange: '0-2\n(Poor)',
      'Technical Skills': 5,
      'Functional Understanding': 8,
      'Communication': 12,
      'Energy & Drive': 6,
      'AI Adoption': 10,
      'Responsibilities & Trust': 4,
      'Teamwork': 7,
      'Managing Processes': 9
    },
    {
      scoreRange: '2.1-4\n(Below Avg)',
      'Technical Skills': 15,
      'Functional Understanding': 22,
      'Communication': 18,
      'Energy & Drive': 20,
      'AI Adoption': 25,
      'Responsibilities & Trust': 16,
      'Teamwork': 14,
      'Managing Processes': 19
    },
    {
      scoreRange: '4.1-6\n(Average)',
      'Technical Skills': 45,
      'Functional Understanding': 52,
      'Communication': 48,
      'Energy & Drive': 50,
      'AI Adoption': 40,
      'Responsibilities & Trust': 55,
      'Teamwork': 53,
      'Managing Processes': 47
    },
    {
      scoreRange: '6.1-8\n(Good)',
      'Technical Skills': 65,
      'Functional Understanding': 58,
      'Communication': 62,
      'Energy & Drive': 60,
      'AI Adoption': 55,
      'Responsibilities & Trust': 68,
      'Teamwork': 70,
      'Managing Processes': 63
    },
    {
      scoreRange: '8.1-10\n(Excellent)',
      'Technical Skills': 35,
      'Functional Understanding': 28,
      'Communication': 22,
      'Energy & Drive': 32,
      'AI Adoption': 18,
      'Responsibilities & Trust': 25,
      'Teamwork': 30,
      'Managing Processes': 26
    }
  ];

  const competencyColors = {
    'Technical Skills': '#3B82F6',      // Blue
    'Functional Understanding': '#10B981', // Emerald  
    'Communication': '#8B5CF6',         // Violet
    'Energy & Drive': '#F59E0B',        // Amber
    'AI Adoption': '#EF4444',           // Red
    'Responsibilities & Trust': '#06B6D4', // Cyan
    'Teamwork': '#84CC16',              // Lime
    'Managing Processes': '#F97316'     // Orange
  };

  const chartData = data || mockData;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Competency Score Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Number of employees in each score range across competency areas
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="scoreRange" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={0}
                textAnchor="middle"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Number of Employees', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [`${value} employees`, name]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              
              {Object.entries(competencyColors).map(([competency, color]) => (
                <Bar
                  key={competency}
                  dataKey={competency}
                  fill={color}
                  radius={[2, 2, 0, 0]}
                  name={competency}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Key Insights:</strong> This chart shows the distribution of employees across performance levels for each competency. 
            Higher concentrations in the 6.1-8 and 8.1-10 ranges indicate strong performance areas, while concentrations 
            in lower ranges highlight areas needing development focus.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetencyScoreChart;