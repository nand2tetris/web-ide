def escape(val):
    return str(val).replace("&", "&amp;") \
           .replace("<", "&lt;") \
           .replace(">", "&gt;") \
           .replace("\"", "&quot;")

class Element:
    def __init__(self, name, attributes, children):
        self.name = name
        self.attributes = attributes
        self.children = children
    
    def write(self):
        element = f'<{self.name}'
        for (k, v) in self.attributes.items():
            if v:
                element += f' {k}="{escape(v)}"'
        if len(self.children) == 0:
            element += '/>'
        else:
            element += '>'
            for child in self.children:
                if child:
                    element += child.write()
            element += f'</{self.name}>'
        return element
    
    def __str__(self):
        return self.write()