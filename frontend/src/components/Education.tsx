import React from 'react';
import { Panel, Typography, Flex } from '@maxhub/max-ui';

// Placeholder for the education page. It can host modules, courses,
// assignments or links to MOOCs. For now we display a coming soon message.

const Education: React.FC = () => {
  return (
    <Panel mode="secondary" className="education-panel">
      <Flex direction="column" align="center" justify="center" style={{ padding: '16px' }}>
        <Typography.Title>Обучение</Typography.Title>
        <Typography.Text>Раздел в разработке. Здесь появятся курсы и факультативы.</Typography.Text>
      </Flex>
    </Panel>
  );
};

export default Education;