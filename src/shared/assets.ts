import { ImageSourcePropType } from 'react-native';
import { TopicId } from '../data/curriculum/types';

export const ILLUSTRATIONS = {
  nodejs: require('../../assets/illustrations/cover_nodejs.jpg') as ImageSourcePropType,
  sql: require('../../assets/illustrations/cover_sql.jpg') as ImageSourcePropType,
  architecture: require('../../assets/illustrations/cover_architecture.jpg') as ImageSourcePropType,
  interview: require('../../assets/illustrations/cover_interview.jpg') as ImageSourcePropType,
};

export function getTopicIllustration(topic: TopicId): ImageSourcePropType {
  switch (topic) {
    case 'nodejs':
    case 'typescript':
      return ILLUSTRATIONS.nodejs;
    case 'sql':
    case 'drizzle':
      return ILLUSTRATIONS.sql;
    case 'architecture':
      return ILLUSTRATIONS.architecture;
  }
}
