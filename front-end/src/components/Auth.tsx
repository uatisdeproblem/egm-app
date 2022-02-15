import { Flex, Image, Text, useAuthenticator } from '@aws-amplify/ui-react';

import '@aws-amplify/ui-react/styles.css';

export const AuthHeader = () => {
  const { isPending } = useAuthenticator();
  return isPending ? (
    <></>
  ) : (
    <Flex justifyContent="center" padding={30} style={{ marginTop: 30 }}>
      <Image alt="logo" src="/assets/images/ESN-star-full-colour.png" width={100} />
    </Flex>
  );
};

export const AuthFooter = () => {
  const { isPending } = useAuthenticator();
  return isPending ? (
    <></>
  ) : (
    <Flex justifyContent="center" padding={30}>
      <Text color="white">Some useful info and links</Text>
    </Flex>
  );
};
