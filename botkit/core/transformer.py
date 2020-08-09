from sentence_transformers import SentenceTransformer
import scipy.spatial

MAX_DISTANCE = 0.7

DEFAULT_MODEL = 'distilbert-base-nli-stsb-mean-tokens'


class TransformerCore:
    name = 'transformer'

    def __init__(self, model=DEFAULT_MODEL):
        print(f"Loading model {model}")
        self.embedder = SentenceTransformer(model)
        self.intents = {}
        self.vecs = []

    def __intent_examples(self):
        return list(self.intents.keys())

    def __learn(self):
        vecs = self.embedder.encode(self.__intent_examples())
        self.vecs = list(zip(self.__intent_examples(), vecs))

    def __learn_one(self, example):
        print(f"Learning example '{example}'")
        vec = self.embedder.encode([example])
        self.vecs.append([example, vec[0]])

    def load_intents(self, intents):
        self.intents = intents
        self.__learn()

    def add_intent(self, example, intent):
        print(f"Adding '{example}' as '{intent}'")
        self.intents[example] = intent
        self.__learn_one(example)

    def intent_of(self, query):
        emb = self.embedder.encode([query])
        vecs = [vec for (example, vec) in self.vecs]
        distances = scipy.spatial.distance.cdist(emb, vecs, "cosine")[0]

        best_dist = 1.0
        best_intent = None

        for example, dist in zip(self.__intent_examples(), distances):
            if dist < best_dist:
                best_dist = dist
                best_intent = self.intents[example]

        return {'score': 1.0 - best_dist, 'intent': best_intent}


def main():
    intents = {
        'How is the weather?': 'weather',
        'Send an email': 'email',
        'Hello': 'greeting'
    }

    t = TransformerCore()
    t.load_intents(intents)
    t.add_intent('Play music', 'music')

    test_queries = [
        'Was it sunny yesterday?',
        'Play some jazz',
        'Send Peter an email',
        'Hi!',
    ]

    for query in test_queries:
        print(f"Query: '{query}'")
        print(t.intent_of(query))


if __name__ == '__main__':
    main()

    # Output:
    # > Query: 'Was it sunny yesterday?'
    # > {'score': 0.5381054447563607, 'intent': 'weather'}
    # > Query: 'Play some jazz'
    # > {'score': 0.5316503575779188, 'intent': 'music'}
    # > Query: 'Send Peter an email'
    # > {'score': 0.59165012001151, 'intent': 'email'}
    # > Query: 'Hi!'
    # > {'score': 0.672180518003876, 'intent': 'greeting'}
