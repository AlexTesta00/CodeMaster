import org.junit.jupiter.api.Assertions._
import org.junit.jupiter.api.Test
import Main.myPrint

class MainTest {

    @Test
def testFunction1(): Unit = {
  assertEquals("Hello World! test",  myPrint("test"))
}

@Test
def testFunction2(): Unit = {
  assertEquals("Hello World! test", myPrint("test"))
}

}
