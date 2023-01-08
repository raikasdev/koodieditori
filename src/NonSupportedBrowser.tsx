import {
  Button, Center, Container, Group, Text, Title, createStyles,
} from '@mantine/core';
import React from 'react';

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: 80,
    paddingBottom: 80,
  },

  label: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: 110,
    lineHeight: 1,
    marginBottom: theme.spacing.xl * 1.5,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[4] : 'black',

    [theme.fn.smallerThan('sm')]: {
      fontSize: 120,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: 'center',
    fontWeight: 900,
    fontSize: 38,

    [theme.fn.smallerThan('sm')]: {
      fontSize: 32,
    },
  },

  description: {
    maxWidth: 750,
    margin: 'auto',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl * 1.5,
  },
}));

export default function NonSupportedBrowser() {
  const { classes } = useStyles();

  return (
    <Center h="100vh">
      <Container className={classes.root}>
        <div className={classes.label}>Selainta ei tueta</div>
        <Title className={classes.title}>
          Käyttämäsi selain ei tue tarvittuja ominaisuuksia.
        </Title>
        <Text color="black" size="lg" align="center" className={classes.description}>
          Valitettavasti selain, jota käytät, ei tue ES6-moduulityyppisiä WebWorkereita.
          Voit vaihtaa selaimeen, joka tukee näitä, jotta voit käyttää sivustoamme.
        </Text>
        <Group position="center">
          Tuettuja selaimia ovat mm. Chrome, Edge, Opera, Brave ja Vivaldi.
        </Group>
      </Container>
    </Center>
  );
}
