const examples = {
  Fibonacci:
`def fibonacci(n):
  return n if n <= 1 else fibonacci(n- 2) + fibonacci(n - 1)

print([fibonacci(n) for n in range(10)])`,
  Matplotlib:
`import matplotlib.pyplot as plt
import numpy as np

data = {'a': np.arange(50),
        'c': np.random.randint(0, 50, 50),
        'd': np.random.randn(50)}
data['b'] = data['a'] + 10 * np.random.randn(50)
data['d'] = np.abs(data['d']) * 100

plt.scatter('a', 'b', c='c', s='d', data=data)
plt.xlabel('entry a')
plt.ylabel('entry b')

plt.show()`,
  Turtle:
`import turtle 

polygon = turtle.Turtle()

num_sides = 6
side_length = 70
angle = 360.0 / num_sides 

for i in range(num_sides):
    polygon.forward(side_length)
    polygon.right(angle)
    
turtle.done()`,
  Sleep:
`import time
text = """Entten tentten teelikamentten
hissun kissun vaapula vissun
eelin keelin klot
viipula vaapula vot
Puh pah pelistä pois!"""
for character in text:
    print(character, end="")
    time.sleep(0.1)`,
};

export default examples;
